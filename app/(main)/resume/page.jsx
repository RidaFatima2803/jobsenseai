import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ResumeBuilder initialContent={resume?.content} />

      {/* ✅ Next Step: Cover Letter */}
      <div className="flex justify-end pt-4 border-t">
        <div className="flex flex-col items-end gap-1">
          <p className="text-sm text-muted-foreground">Next Step</p>
          <Link href="/ai-cover-letter">
            <Button className="gap-2">
              Go to Cover Letter
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}