import { linearGraphql } from "./linearClient";

export async function getTeamByKey(teamKey) {
  const data = await linearGraphql(
    `
    query TeamByKey($key: String!) {
      teams(filter: { key: { eq: $key } }) {
        nodes {
          id
          key
          name
          states {
            nodes {
              id
              name
              type
              position
            }
          }
        }
      }
    }
  `,
    { key: teamKey }
  );

  return data?.teams?.nodes?.[0] || null;
}

export async function getLabelByName(labelName) {
  const data = await linearGraphql(
    `
    query LabelByName($name: String!) {
      issueLabels(filter: { name: { eq: $name } }) {
        nodes {
          id
          name
        }
      }
    }
  `,
    { name: labelName }
  );

  return data?.issueLabels?.nodes?.[0] || null;
}

export function findWorkflowStateIdByName(team, stateName) {
  if (!team?.states?.nodes?.length) return null;
  const wanted = String(stateName || "").trim().toLowerCase();
  if (!wanted) return null;
  return (
    team.states.nodes.find((s) => String(s?.name || "").trim().toLowerCase() === wanted)
      ?.id || null
  );
}

export function mapPriority(priority) {
  switch (priority) {
    case "urgent":
      return 1;
    case "high":
      return 2;
    case "medium":
      return 3;
    case "low":
      return 4;
    case "none":
    default:
      return 0;
  }
}

export async function createIssue({
  teamId,
  stateId,
  labelIds,
  title,
  description,
  priority,
}) {
  const data = await linearGraphql(
    `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
          url
          priority
          state { id name }
          labels { nodes { id name } }
        }
      }
    }
  `,
    {
      input: {
        teamId,
        stateId: stateId || undefined,
        labelIds: labelIds?.length ? labelIds : undefined,
        title,
        description,
        priority,
      },
    }
  );

  if (!data?.issueCreate?.success || !data?.issueCreate?.issue) {
    throw new Error("Linear issueCreate failed");
  }

  return data.issueCreate.issue;
}

export async function listIssuesByTeamAndLabels({ teamId, labelIds, first = 100 }) {
  // Dynamically build the label filter:
  // We want issues that match ALL of the provided labelIds.
  // Filter structure: { labels: { id: { eq: "..." } } }
  // But to match multiple, we need to use 'and' operator if there's more than one.

  let labelsFilter = {};

  if (labelIds?.length === 1) {
    labelsFilter = { labels: { some: { id: { eq: labelIds[0] } } } };
  } else if (labelIds?.length > 1) {
    labelsFilter = {
      and: labelIds.map((id) => ({
        labels: { some: { id: { eq: id } } },
      })),
    };
  }

  const data = await linearGraphql(
    `
    query IssuesByTeamAndLabels($first: Int!, $filter: IssueFilter) {
      issues(
        first: $first
        filter: $filter
      ) {
        nodes {
          id
          identifier
          title
          description
          priority
          updatedAt
          createdAt
          state { id name type }
          labels { nodes { id name } }
          assignee { name avatarUrl }
        }
      }
    }
  `,
    {
      teamId,
      first,
      filter: {
        team: { id: { eq: teamId } },
        ...labelsFilter,
      },
    }
  );

  return data?.issues?.nodes || [];
}


