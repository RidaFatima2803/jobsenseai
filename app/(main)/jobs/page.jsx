"use client";

import { useState } from "react";

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      console.log("FRONTEND DATA:", data);

      // VERY IMPORTANT FIX
      if (Array.isArray(data)) {
        setJobs(data);
      } else {
        setJobs([]);
        setError(data.error || "Failed to fetch jobs");
      }
    } catch (err) {
      console.error(err);
      setJobs([]);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Search Pakistan Jobs 🇵🇰
      </h1>

      <div className="flex gap-4 mb-6">
        <input
          className="border p-3 w-full rounded bg-black"
          placeholder="Frontend Developer Karachi"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={searchJobs}
          className="bg-black text-white px-6 rounded"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <p className="text-red-500 mb-4">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {Array.isArray(jobs) &&
          jobs.map((job, i) => (
            <div
              key={i}
              className="border p-4 rounded"
            >
              <h2 className="font-bold text-lg">
                {job.title}
              </h2>

              <p className="font-medium">
  {job.company}
</p>

<p className="text-sm text-gray-500">
  📍 {job.location}
</p>

<p className="text-sm">
  🌐 Source: {job.source}
</p>

<p className="text-sm">
  💼 {job.employmentType}
</p>

<p className="text-sm">
  🕒 {job.postedDate}
</p>

<p className="text-sm font-medium text-green-600">
  💰 {job.salary}
</p>

              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Apply Now
              </a>
            </div>
          ))}
      </div>
    </div>
  );
}