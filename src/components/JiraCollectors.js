"use client";

import { useEffect } from "react";

export default function JiraCollectors() {
	useEffect(() => {
		// Only run on client side
		if (typeof window !== "undefined") {
			// Dynamically load jQuery
			const loadJQuery = async () => {
				if (!window.jQuery) {
					const script = document.createElement("script");
					script.src =
						"https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js";
					script.async = true;
					script.onload = setupJiraCollectors;
					document.head.appendChild(script);
				} else {
					setupJiraCollectors();
				}
			};

			const setupJiraCollectors = () => {
				// Bug report collector
				const jQueryBug = window.jQuery;
				jQueryBug.ajax({
					url: "https://danblock1997.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/xghl7j/b/9/b0105d975e9e59f24a3230a22972a71a/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs.js?locale=en-GB&collectorId=abed092e",
					type: "get",
					cache: true,
					dataType: "script",
				});

				// Feature request collector
				const jQueryFeature = window.jQuery;
				jQueryFeature.ajax({
					url: "https://danblock1997.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/xghl7j/b/9/b0105d975e9e59f24a3230a22972a71a/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs.js?locale=en-GB&collectorId=bacdc403",
					type: "get",
					cache: true,
					dataType: "script",
				});

				// Set up trigger functions
				if (window.ATL_JQ_PAGE_PROPS == null) {
					window.ATL_JQ_PAGE_PROPS = {};
				}

				// Store the original trigger function if it exists
				const originalTriggerFunction =
					window.ATL_JQ_PAGE_PROPS.triggerFunction;

				// Set up the new trigger function
				window.ATL_JQ_PAGE_PROPS = {
					// Bug report trigger
					abed092e: {
						triggerFunction: function (showCollectorDialog) {
							// For bug reports
							window.jQuery("#bugReportTrigger").click(function (e) {
								e.preventDefault();
								showCollectorDialog();
							});
						},
					},
					// Feature request trigger
					bacdc403: {
						triggerFunction: function (showCollectorDialog) {
							// For feature requests
							window.jQuery("#featureRequestTrigger").click(function (e) {
								e.preventDefault();
								showCollectorDialog();
							});
						},
					},
				};
			};

			loadJQuery();
		}
	}, []);

	return null; // This component doesn't render anything visible
}
