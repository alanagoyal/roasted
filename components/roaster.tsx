"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const loadingRoasts = [
  "Starting up a Browserbase session...",
  "Analyzing your 'professional' selfie taken in a gaming chair...",
  "Counting how many times you've forked 'awesome-lists'...",
  "Measuring the dust on your abandoned side projects...",
  "Calculating the ratio of README updates to actual code...",
  "Scanning commit messages for 'fixed typo' and 'minor changes'...",
  "Evaluating your Stack Overflow copy-paste efficiency...",
  "Counting how many times you've starred your own repos...",
  "Analyzing your creative ways of avoiding unit tests...",
  "Measuring the staleness of your dependencies...",
  "Calculating your 'it works on my machine' incidents...",
];

export function Roaster() {
  const [githubUrl, setGithubUrl] = useState("");
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRoast, setLoadingRoast] = useState("");
  const roastRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      let index = 0;
      interval = setInterval(() => {
        setLoadingRoast(loadingRoasts[index]);
        index = (index + 1) % loadingRoasts.length;
      }, 2000);
    } else {
      setLoadingRoast("");
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (roast && roastRef.current) {
      const text = roastRef.current;
      text.innerHTML = roast
        .split("")
        .map(
          (char) =>
            `<span class="inline-block transition-transform duration-300 ease-in-out transform hover:scale-125 hover:-translate-y-1">${char}</span>`
        )
        .join("");
    }
  }, [roast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRoast("");

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roast");
      }

      const data = await response.json();
      setRoast(data.roast);
    } catch (error) {
      console.error("Error:", error);
      setRoast("Failed to generate roast. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (roastRef.current) {
      navigator.clipboard.writeText(roastRef.current.innerText).then(() => {
        toast({ description: "Copied to clipboard" });
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-left">
            GitHub Profile Roaster
          </CardTitle>
          <CardDescription className="text-left">
            Paste your GitHub profile URL and get roasted!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <GitHubLogoIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="url"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                required
                className="pl-10"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Roasting..." : "Roast Me!"}
            </Button>
          </form>
          {loading && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <div className="flex items-center space-x-2 overflow-hidden">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-gray-700 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                  {loadingRoast}
                </p>
              </div>
            </div>
          )}
          {roast && !loading && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Your Roast:</h2>
              <div className="flex items-center">
                <p
                  ref={roastRef}
                  className="text-gray-700 cursor-default flex-grow"
                  aria-live="polite"
                  dangerouslySetInnerHTML={{ __html: roast }}
                ></p>
                <Button onClick={handleCopy} className="ml-2">
                  Copy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}