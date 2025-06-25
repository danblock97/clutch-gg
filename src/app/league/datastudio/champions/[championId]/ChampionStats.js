"use client";

const StatLine = ({ label, value, perLevel }) => (
	<div className="flex justify-between text-sm py-1 border-b border-gray-700/50">
		<span className="text-gray-400">{label}</span>
		<span className="font-semibold">
			{value}{" "}
			{perLevel > 0 && (
				<span className="text-xs text-gray-500">(+{perLevel} / lvl)</span>
			)}
		</span>
	</div>
);

export default function ChampionStats({ stats }) {
	if (!stats) return null;

	return (
		<div>
			<h3 className="text-2xl font-bold mb-4">Base Stats</h3>
			<div className="space-y-1">
				<StatLine label="Health" value={stats.hp} perLevel={stats.hpperlevel} />
				<StatLine
					label="HP Regen"
					value={stats.hpregen}
					perLevel={stats.hpregenperlevel}
				/>
				<StatLine
					label="Armor"
					value={stats.armor}
					perLevel={stats.armorperlevel}
				/>
				<StatLine
					label="Magic Resist"
					value={stats.spellblock}
					perLevel={stats.spellblockperlevel}
				/>
				<StatLine
					label="Attack Damage"
					value={stats.attackdamage}
					perLevel={stats.attackdamageperlevel}
				/>
				<StatLine
					label="Attack Speed"
					value={stats.attackspeed}
					perLevel={stats.attackspeedperlevel}
				/>
				<StatLine label="Move Speed" value={stats.movespeed} perLevel={0} />
			</div>
		</div>
	);
}
