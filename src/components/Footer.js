import Link from "next/link";
import React from "react";
import {
  FaDiscord,
  FaEnvelope,
  FaShieldAlt,
  FaBalanceScale,
  FaGithub,
  FaChartBar,
  FaBullhorn,
  FaRobot,
} from "react-icons/fa";
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[--card-bg] border-t border-[--card-border]">
      {/* Main Footer Section */}
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Logo and About Section */}
          <div className="md:col-span-4">
            <div className="flex items-center mb-4">
              <Image
                src="/images/logo.png"
                alt="ClutchGG Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[--primary] to-[--secondary]">
                ClutchGG.LOL
              </h3>
            </div>
            <p className="text-[--text-secondary] mb-6">
              Your ultimate destination for in-depth League of Legends analytics
              and real-time insights into players' performance.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://discord.gg/BeszQxTn9D"
                target="_blank"
                aria-label="Discord"
                className="text-[--text-secondary] hover:text-[#5865F2] transition-colors"
              >
                <FaDiscord className="text-xl" />
              </Link>
              <Link
                href="mailto:contact@danblock.dev"
                aria-label="Email"
                className="text-[--text-secondary] hover:text-[--primary] transition-colors"
              >
                <FaEnvelope className="text-xl" />
              </Link>
              <Link
                href="https://github.com/danblock97"
                target="_blank"
                aria-label="GitHub"
                className="text-[--text-secondary] hover:text-white transition-colors"
              >
                <FaGithub className="text-xl" />
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2">
            <h4 className="text-sm uppercase font-semibold text-[--text-secondary] tracking-widest mb-4">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm hover:text-[--primary] transition-colors inline-flex items-center"
                >
                  <FaChartBar className="mr-2 text-xs" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/league/leaderboard"
                  className="text-sm hover:text-[--primary] transition-colors inline-flex items-center"
                >
                  <FaChartBar className="mr-2 text-xs" />
                  Leaderboards
                </Link>
              </li>
            </ul>
          </div>

          {/* Other League Trackers */}
          <div className="md:col-span-3">
            <h4 className="text-sm uppercase font-semibold text-[--text-secondary] tracking-widest mb-4">
              Other Stat Trackers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://astrostats.vercel.app"
                  target="_blank"
                  className="text-sm hover:text-[--primary] transition-colors inline-flex items-center"
                >
                  <FaRobot className="mr-2 text-xs" />
                  AstroStats - Discord Bot
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-3">
            <h4 className="text-sm uppercase font-semibold text-[--text-secondary] tracking-widest mb-4">
              Legal & Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/privacy-policy"
                  className="text-sm hover:text-[--primary] transition-colors inline-flex items-center"
                >
                  <FaShieldAlt className="mr-2 text-xs" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms-of-service"
                  className="text-sm hover:text-[--primary] transition-colors inline-flex items-center"
                >
                  <FaBalanceScale className="mr-2 text-xs" />
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright and Riot Notice */}
      <div className="bg-[--card-bg-secondary] border-t border-[--card-border] py-4">
        <div className="container max-w-6xl mx-auto px-4 text-center text-xs">
          <p className="text-[--text-secondary]">
            ClutchGG.LOL © {currentYear}. All rights reserved.
          </p>
          <p className="mt-2 text-[--text-secondary] max-w-2xl mx-auto">
            ClutchGG.LOL is not endorsed by Riot Games and does not reflect the
            views or opinions of Riot Games or anyone officially involved in
            producing or managing Riot Games properties. Riot Games and all
            associated properties are trademarks or registered trademarks of
            Riot Games, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
