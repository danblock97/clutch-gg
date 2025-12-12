import { NextResponse } from "next/server";
import {
	createIssue,
	findWorkflowStateIdByName,
	getLabelByName,
	getTeamByKey,
	mapPriority,
} from "@/lib/linear/linearService";

async function verifyTurnstile({ token, ip }) {
	const secret = process.env.TURNSTILE_SECRET_KEY;
	if (!secret) throw new Error("Missing TURNSTILE_SECRET_KEY");

	const form = new FormData();
	form.append("secret", secret);
	form.append("response", token);
	if (ip) form.append("remoteip", ip);

	const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		body: form,
	});

	const json = await res.json().catch(() => null);
	return {
		ok: !!json?.success,
		errorCodes: json?.["error-codes"] || [],
	};
}

function isTurnstileDisabledForDev() {
	return process.env.NODE_ENV !== "production" && process.env.TURNSTILE_DISABLED === "true";
}

export async function POST(req) {
	try {
		const teamKey = process.env.LINEAR_TEAM_KEY || "OPS";
		const labelName = process.env.LINEAR_LABEL_NAME || "ClutchGG";
		const desiredStateName = "Backlog";

		const body = await req.json().catch(() => ({}));
		const title = String(body?.title || "").trim();
		const description = String(body?.description || "").trim();
		const priority = String(body?.priority || "none");
		const turnstileToken = String(body?.turnstileToken || "");
		const honeypot = String(body?.honeypot || "");

		if (honeypot) {
			return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
		}
		if (!title || title.length < 3 || title.length > 120) {
			return NextResponse.json({ error: "Title is required (3–120 chars)" }, { status: 400 });
		}
		if (!description || description.length < 10 || description.length > 5000) {
			return NextResponse.json(
				{ error: "Description is required (10–5000 chars)" },
				{ status: 400 }
			);
		}
		if (!["none", "urgent", "high", "medium", "low"].includes(priority)) {
			return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
		}

		if (!isTurnstileDisabledForDev()) {
			if (!turnstileToken) {
				return NextResponse.json({ error: "Verification required" }, { status: 400 });
			}

			const ip = req.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim();
			const turnstile = await verifyTurnstile({ token: turnstileToken, ip });
			if (!turnstile.ok) {
				return NextResponse.json(
					{ error: "Verification failed", details: turnstile.errorCodes },
					{ status: 400 }
				);
			}
		}

		const team = await getTeamByKey(teamKey);
		if (!team?.id) {
			return NextResponse.json(
				{ error: `Linear team not found for key '${teamKey}'` },
				{ status: 500 }
			);
		}

		const label = await getLabelByName(labelName);
		if (!label?.id) {
			return NextResponse.json(
				{ error: `Linear label not found: '${labelName}'` },
				{ status: 500 }
			);
		}

		const stateId = findWorkflowStateIdByName(team, desiredStateName);
		const issue = await createIssue({
			teamId: team.id,
			stateId,
			labelIds: [label.id],
			title,
			description,
			priority: mapPriority(priority),
		});

		return NextResponse.json(
			{
				ok: true,
				turnstileBypassed: isTurnstileDisabledForDev(),
				issue: {
					id: issue.id,
					identifier: issue.identifier,
					title: issue.title,
					url: issue.url,
					priority: issue.priority,
					state: issue.state,
					labels: issue.labels?.nodes || [],
				},
			},
			{
				status: 200,
				headers: { "Cache-Control": "no-store, max-age=0" },
			}
		);
	} catch (error) {
		return NextResponse.json(
			{ error: error?.message || "Internal server error" },
			{ status: 500 }
		);
	}
}


