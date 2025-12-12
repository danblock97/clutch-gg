import { NextResponse } from "next/server";
import { getLabelByName, getTeamByKey, listIssuesByTeamAndLabel } from "@/lib/linear/linearService";

export async function GET() {
	try {
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

		const issues = await listIssuesByTeamAndLabel({
			teamId: team.id,
			labelId: label.id,
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


