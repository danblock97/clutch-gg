import { NextResponse } from 'next/server';

const LINEAR_API_URL = 'https://api.linear.app/graphql';

const PRIORITY_MAP = {
  Low: 4,
  Medium: 3,
  High: 2,
  Critical: 1,
};

async function linearRequest(query, variables = {}) {
  const apiKey = process.env.LINEAR_API_KEY?.trim();
  if (!apiKey) throw new Error('LINEAR_API_KEY is not configured.');

  const res = await fetch(LINEAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After') || '60';
    throw new Error(`Rate limited by Linear API. Please try again in ${retryAfter} seconds.`);
  }

  if (!res.ok) {
    throw new Error(`Linear API responded with status ${res.status}.`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data;
}

async function getTeamId() {
  const teamName = process.env.LINEAR_TEAM_NAME;
  if (!teamName) throw new Error('LINEAR_TEAM_NAME is not configured.');

  const data = await linearRequest(`
    query {
      teams {
        nodes { id name }
      }
    }
  `);

  const team = data.teams.nodes.find(
    (t) => t.name.toLowerCase() === teamName.toLowerCase()
  );

  if (!team) {
    throw new Error(`Team "${teamName}" not found in Linear workspace.`);
  }

  return team.id;
}

async function resolveOrCreateLabel(teamId, name) {
  // Fetch all workspace labels
  const data = await linearRequest(`
    query {
      issueLabels(first: 250) {
        nodes { id name }
      }
    }
  `);

  const existing = data.issueLabels.nodes.find(
    (l) => l.name.toLowerCase() === name.toLowerCase()
  );

  if (existing) return existing.id;

  // Create label under the team
  try {
    const created = await linearRequest(
      `
      mutation($input: IssueLabelCreateInput!) {
        issueLabelCreate(input: $input) {
          issueLabel { id name }
        }
      }
    `,
      { input: { name, teamId } }
    );
    return created.issueLabelCreate.issueLabel.id;
  } catch (err) {
    console.warn(`[Support] Could not create label "${name}": ${err.message}`);
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      subject,
      category,
      priority,
      description,
      stepsToReproduce,
      affectedProduct,
      browserInfo,
      timestamp,
    } = body;

    // Server-side validation
    if (!name || !email || !subject || !category || !priority || !description || !affectedProduct) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    if (description.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: 'Description must be at least 20 characters.' },
        { status: 400 }
      );
    }

    const teamId = await getTeamId();

    // Build the markdown description
    const lines = [
      '## Support Request',
      '',
      `**Submitted by:** ${name} (${email})`,
      `**Category:** ${category}`,
      `**Priority:** ${priority}`,
      `**Affected Product/Feature:** ${affectedProduct}`,
      '',
      '---',
      '',
      '### Description',
      '',
      description,
    ];

    if (stepsToReproduce?.trim()) {
      lines.push('', '### Steps to Reproduce', '', stepsToReproduce.trim());
    }

    lines.push('', '---', '');
    lines.push(`**System Info:** \`${browserInfo || 'Unknown'}\``);
    lines.push(`**Submitted:** ${timestamp || new Date().toISOString()}`);

    const markdownDescription = lines.join('\n');

    // Resolve or create labels: "Support" + lowercased category
    const labelNames = ['Support', category.toLowerCase().replace(/\s+/g, '-')];
    const labelIds = (
      await Promise.all(labelNames.map((n) => resolveOrCreateLabel(teamId, n)))
    ).filter(Boolean);

    // Create the Linear issue
    const data = await linearRequest(
      `
      mutation($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue { id identifier url }
        }
      }
    `,
      {
        input: {
          teamId,
          title: `[${category}] ${subject}`,
          description: markdownDescription,
          priority: PRIORITY_MAP[priority] ?? 3,
          labelIds,
        },
      }
    );

    if (!data.issueCreate.success) {
      throw new Error('Linear issue creation returned unsuccessful.');
    }

    const issue = data.issueCreate.issue;
    console.info(`[Support] Created Linear issue ${issue.identifier}`);

    return NextResponse.json({
      success: true,
      issueId: issue.identifier,
      issueUrl: issue.url,
    });
  } catch (err) {
    console.error('[Support] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
