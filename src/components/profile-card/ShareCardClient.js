"use client";
import React, { useState, useCallback } from "react";
import ProfileCard from "./ProfileCard";

export default function ShareCardClient(props) {
  const [copied, setCopied] = useState(false);

  const handleContactClick = useCallback(async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // no-op
    }
  }, []);

  return (
    <ProfileCard
      {...props}
      contactText={copied ? "Copied!" : props.contactText || "Copy Link"}
      onContactClick={handleContactClick}
    />
  );
}

