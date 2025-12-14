import { NextResponse } from "next/server";
import { getLabelByName, getTeamByKey, listIssuesByTeamAndLabels } from "@/lib/linear/linearService";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const type = searchParams.get("type") === "feature" ? "feature" : "bug";

		const teamKey = process.env.LINEAR_TEAM_KEY || "OPS";
		const labelName = process.env.LINEAR_LABEL_NAME || "ClutchGG";

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

		const secondaryLabelName = type === "feature" ? "Feature" : "Bug";
		const secondaryLabel = await getLabelByName(secondaryLabelName);
		if (!secondaryLabel?.id) {
			return NextResponse.json(
				{ error: `Linear label not found: '${secondaryLabelName}'` },
				{ status: 500 }
			);
		}

		// Use new multi-label filter
		const issues = await listIssuesByTeamAndLabels({
			teamId: team.id,
			labelIds: [label.id, secondaryLabel.id], // AND logic
			first: 100,
		});

		return NextResponse.json(
			{
				ok: true,
				label: { name: labelName },
				team: { key: teamKey, name: team.name },
				issues: issues.map((i) => ({
					id: i.id,
					identifier: i.identifier,
					title: i.title,
					priority: i.priority,
					state: i.state,
					updatedAt: i.updatedAt,
					createdAt: i.createdAt,
					descriptionSnippet: i.description ? String(i.description).slice(0, 240) : "",
				})),
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
				},
			}
		);
	} catch (error) {
		return NextResponse.json(
			{ error: error?.message || "Internal server error" },
			{ status: 500 }
		);
	}
}


