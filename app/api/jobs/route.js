export async function POST(req) {
  try {
    const body = await req.json();

    const query = body.query || "Frontend Developer Pakistan";

    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search-v2?query=${encodeURIComponent(
        query
      )}&page=1&num_pages=1&country=pk`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      }
    );

    const data = await response.json();

    console.log("FULL API RESPONSE:", data);

    if (!response.ok) {
      return Response.json(
        {
          error:
            data.message ||
            data.error ||
            "RapidAPI request failed",
        },
        { status: response.status }
      );
    }

    const jobsArray = Array.isArray(data.data?.jobs)
      ? data.data.jobs
      : [];

    const jobs = jobsArray.map((job) => ({
      title: job.job_title || "No Title",

      company:
        job.employer_name || "Unknown Company",

      location: `${job.job_city || ""}, ${
        job.job_country || "Pakistan"
      }`,

      url: job.job_apply_link || "#",

      source:
        job.job_publisher || "Unknown Source",

      employmentType:
        job.job_employment_type || "Not Specified",

      postedDate:
        job.job_posted_human_readable ||
        "Recently",

      salary: (() => {
  const min = job.job_min_salary;
  const max = job.job_max_salary;
  const currency = job.job_salary_currency || "";

  // Case 1: both min and max exist
  if (min && max) {
    return `${min} - ${max} ${currency}`.trim();
  }

  // Case 2: only min exists (very common in APIs)
  if (min) {
    return `From ${min} ${currency}`.trim();
  }

  // Case 3: only max exists
  if (max) {
    return `Up to ${max} ${currency}`.trim();
  }

  // Case 4: sometimes salary comes in description/text fields
  const text =
    job.job_description ||
    job.job_highlights?.Qualifications?.join(" ") ||
    "";

  const match = text.match(/(\$|Rs\.?|PKR)\s?[\d,]+/i);

  if (match) {
    return `~ ${match[0]}`;
  }

  return "Salary Not Disclosed";
})(), 
    }));

    return Response.json(jobs);
  } catch (error) {
    console.error("SERVER ERROR:", error);

    return Response.json(
      {
        error: error.message || "Server error",
      },
      { status: 500 }
    );
  }
}