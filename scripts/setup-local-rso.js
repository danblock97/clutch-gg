// This script helps set up a local development environment for RSO authentication
// It creates an .env.local.dev file with the tunnel URL for testing

const fs = require("fs");
const { execSync } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function setupLocalDev() {
	console.log("Setting up local development environment for RSO testing...");

	try {
		// Check if ngrok is installed
		try {
			execSync("ngrok --version", { stdio: "ignore" });
			console.log("✅ Ngrok is installed");
		} catch (err) {
			console.error(
				"❌ Ngrok is not installed. Please install it from https://ngrok.com/download"
			);
			process.exit(1);
		}

		// Prompt for ngrok auth token if needed
		rl.question(
			"Do you need to configure ngrok auth token? (y/n): ",
			(answer) => {
				if (answer.toLowerCase() === "y") {
					rl.question("Enter your ngrok auth token: ", (token) => {
						try {
							execSync(`ngrok config add-authtoken ${token}`);
							console.log("✅ Ngrok auth token configured");
							continueSetup();
						} catch (err) {
							console.error(
								"❌ Failed to configure ngrok auth token:",
								err.message
							);
							process.exit(1);
						}
					});
				} else {
					continueSetup();
				}
			}
		);

		function continueSetup() {
			// Create .env.local.dev file
			const envContent = `USE_TUNNEL=true
TUNNEL_URL=http://localhost:4040/api/tunnels/command_line
# Copy your Riot API credentials here
RIOT_CLIENT_ID=your_client_id_here
RIOT_CLIENT_SECRET=your_client_secret_here
`;

			fs.writeFileSync(".env.local.dev", envContent);
			console.log("✅ Created .env.local.dev file");

			console.log(
				"\n🚀 Setup Complete! Follow these steps to test RSO locally:"
			);
			console.log("1. Start ngrok with: ngrok http 3000");
			console.log("2. Copy the https URL from ngrok");
			console.log(
				"3. Edit .env.local.dev and replace TUNNEL_URL with your ngrok URL"
			);
			console.log("4. Add your Riot Client ID and Secret to .env.local.dev");
			console.log(
				"5. Register your ngrok URL + /api/auth/callback in the Riot Developer Portal"
			);
			console.log("6. Start your dev server with: npm run dev:rso");
			console.log("\nHappy testing! 🎮");

			rl.close();
		}
	} catch (err) {
		console.error("Error setting up local development:", err);
		rl.close();
	}
}

setupLocalDev();
