"use client";

import { parseResumeWithAI } from "@/actions/resume";
import { useState, useEffect, useRef } from "react";
import HomeButton from "@/components/HomeButton";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";

import { Button } from "@/components/ui/button";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";

import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";

export default function ResumeBuilder({
  initialContent,
}) {
  const [activeTab, setActiveTab] =
    useState("edit");

  const [previewContent, setPreviewContent] =
    useState(initialContent || "");

  const { user } = useUser();

  const [resumeMode, setResumeMode] =
    useState("preview");

  const [uploadedFileName, setUploadedFileName] =
    useState(null);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const fileInputRef = useRef(null);
  const isUserEditingRef = useRef(false);
  const suppressFormSyncRef = useRef(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),

    defaultValues: {
      fullName: "",
      contactInfo: {
        email: "",
        mobile: "",
        linkedin: "",
        twitter: "",
      },
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch({
  fullName: "",
  contactInfo: {},
  summary: "",
  skills: "",
  experience: [],
  education: [],
  projects: [],
});

  // AUTO UPDATE MARKDOWN
  // AUTO UPDATE MARKDOWN
useEffect(() => {
  if (
    suppressFormSyncRef.current ||
    isUserEditingRef.current
  ) {
    suppressFormSyncRef.current = false;
    isUserEditingRef.current = false;
    return;
  }

  const newContent =
    getCombinedContent();

  setPreviewContent((prev) =>
    prev === newContent
      ? prev
      : newContent
  );
}, [
  formValues.fullName,

  formValues.summary,

  formValues.skills,

  JSON.stringify(
    formValues.contactInfo
  ),

  JSON.stringify(
    formValues.experience
  ),

  JSON.stringify(
    formValues.education
  ),

  JSON.stringify(
    formValues.projects
  ),
]);
  // SAVE STATUS
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success(
        "Resume saved successfully!"
      );
    }

    if (saveError) {
      toast.error(
        saveError.message ||
          "Failed to save resume"
      );
    }
  }, [saveResult, saveError, isSaving]);

  // CONTACT MARKDOWN
  const getContactMarkdown = () => {
    const { contactInfo, fullName } =
      formValues;

    const displayName =
      fullName?.trim() ||
      user?.fullName ||
      "Your Name";

    const parts = [];

    if (contactInfo?.email)
      parts.push(`📧 ${contactInfo.email}`);

    if (contactInfo?.mobile)
      parts.push(`📱 ${contactInfo.mobile}`);

    if (contactInfo?.linkedin)
      parts.push(
        `💼 [LinkedIn](${contactInfo.linkedin})`
      );

    if (contactInfo?.twitter)
      parts.push(
        `🐦 [Twitter](${contactInfo.twitter})`
      );

    return `# ${displayName}

${parts.join(" | ")}`;
  };

  // FULL RESUME MARKDOWN
  const getCombinedContent = () => {
  const {
    fullName,
    contactInfo,
    summary,
    skills,
    experience = [],
    education = [],
    projects = [],
  } = formValues;

  const buildEntries = (
    title,
    items
  ) => {
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return "";
    }

    return `
## ${title}

${items
  .map((item) => {
    return `
### ${item.title || ""}

${
  item.organization
    ? `**${item.organization}**`
    : ""
}

${
  item.startDate || ""
}
${
  item.current
    ? " - Present"
    : item.endDate
    ? ` - ${item.endDate}`
    : ""
}

${item.description || ""}
`;
  })
  .join("\n")}
`;
  };

  return `
${getContactMarkdown()}

${
  summary
    ? `
## Professional Summary

${summary}
`
    : ""
}

${
  skills
    ? `
## Skills

${skills}
`
    : ""
}

${buildEntries(
  "Work Experience",
  experience
)}

${buildEntries(
  "Education",
  education
)}

${buildEntries(
  "Projects",
  projects
)}
`
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
  // SAVE
  const onSubmit = async () => {
    try {
      const finalContent =
        previewContent?.trim() ||
        getCombinedContent();

      if (!finalContent) {
        toast.error("Resume is empty");
        return;
      }

      await saveResumeFn(finalContent);

      toast.success(
        "Resume saved successfully!"
      );
    } catch (err) {
      console.error("SAVE ERROR:", err);

      toast.error("Failed to save resume");
    }
  };

  // COMPACT ONE-PAGE PDF
  const generatePDF = () => {
    if (!previewContent?.trim()) {
      toast.error("Nothing to export");
      return;
    }

    setIsGenerating(true);

    try {
      const printWindow = window.open(
        "",
        "_blank"
      );

      if (!printWindow) {
        toast.error("Popup blocked");
        return;
      }

      const formattedContent = previewContent
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(
          /^## (.*$)/gim,
          "<h2>$1</h2>"
        )
        .replace(
          /^### (.*$)/gim,
          "<h3>$1</h3>"
        )
        .replace(
          /\*\*(.*?)\*\*/gim,
          "<strong>$1</strong>"
        )
        .replace(/\n/g, "<br />");

      printWindow.document.write(`
      <html>
      <head>
        <title>Resume PDF</title>

        <style>

*{
box-sizing:border-box;
}

html,
body{
margin:0;
padding:0;
}

body{
font-family:Arial,sans-serif;

background:#fff;

color:#111827;

width:210mm;

min-height:297mm;

margin:auto;

padding:18mm 18mm 16mm;

font-size:13px;

line-height:1.45;

overflow:visible;
}

h1{
font-size:22px;

margin:0 0 6px;

padding-bottom:4px;

border-bottom:1px solid #111827;
}

h2{
font-size:13px;

margin-top:8px;

margin-bottom:3px;

padding-bottom:2px;

border-bottom:1px solid #d1d5db;

page-break-after:avoid;
}

h3{
font-size:11px;

margin:4px 0;

page-break-after:avoid;
}

p{
margin:0;
}

strong{
font-weight:600;
}

ul{
padding-left:14px;

margin:2px 0;
}

li{
margin-bottom:1px;
}

br{
display:block;

margin:1px 0;

content:"";
}

hr{
margin:4px 0;

border:none;

border-top:1px solid #d1d5db;
}

a{
color:#111827;

text-decoration:none;
}

iframe{
display:none;
}

h1,
h2,
h3,
p,
ul,
li{
page-break-inside:avoid;
}

@page{
size:A4 portrait;

margin:5mm;
}

@media print{

html,
body{
height:auto;
}

body{
zoom:0.82;

padding:0;
}

*{
page-break-inside:avoid;
}

}

</style>
      </head>

      <body>
        ${formattedContent}

        <script>
          window.onload = function() {
            window.print();

            setTimeout(() => {
              window.close();
            }, 1000);
          };
        <\/script>
      </body>
      </html>
      `);

      printWindow.document.close();

      toast.success(
        'Print dialog opened — choose "Save as PDF".'
      );
    } catch (error) {
      console.error(
        "PDF generation error:",
        error
      );

      toast.error("Failed to generate PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  // FILE UPLOAD
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadedFileName(file.name);

    try {
      // TXT / MD
      if (
        file.type === "text/plain" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".md")
      ) {
        const text = await file.text();

        suppressFormSyncRef.current = true;

        setPreviewContent(text);

        setActiveTab("preview");

        toast.success(
          `"${file.name}" loaded successfully!`
        );

        e.target.value = "";
        return;
      }

      // PDF
      if (
        file.type === "application/pdf" ||
        file.name.endsWith(".pdf")
      ) {
        toast.loading("Opening PDF...", {
          id: "pdf-open",
        });

        const fileURL =
          URL.createObjectURL(file);

        const markdownContent = `
# Uploaded Resume

📄 **${file.name}**

---

<iframe
  src="${fileURL}"
  width="100%"
  height="800px"
  style="border:none;border-radius:12px;"
></iframe>
`;

        suppressFormSyncRef.current = true;

        setPreviewContent(markdownContent);

        setActiveTab("preview");

        toast.dismiss("pdf-open");

        toast.success(
          "Resume uploaded successfully!"
        );

        e.target.value = "";
        return;
      }

      toast.error(
        "Unsupported file type. Upload PDF, TXT or MD."
      );
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      toast.dismiss("pdf-open");

      toast.error(
        "Failed to open resume file."
      );
    }

    e.target.value = "";
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // DELETE RESUME
  const handleDeleteResume = () => {
    suppressFormSyncRef.current = true;

    setUploadedFileName(null);

    setPreviewContent("");

    reset({
      fullName: "",
      contactInfo: {
        email: "",
        mobile: "",
        linkedin: "",
        twitter: "",
      },
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.success(
      "Resume cleared successfully!"
    );
  };

  return (
    <div
      data-color-mode="light"
      className="space-y-4"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Resume Builder
        </h1>

        <div className="flex flex-wrap gap-2 items-center justify-end">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={triggerFileUpload}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />

              {uploadedFileName
                ? "Upload Another CV"
                : "Upload CV"}
            </Button>

            {uploadedFileName && (
              <>
                <Button
                  variant="destructive"
                  type="button"
                  onClick={handleDeleteResume}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>

                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {uploadedFileName}
                </span>
              </>
            )}
          </div>

          <Button
            variant="destructive"
            type="button"
            onClick={onSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>

          <Button
            onClick={generatePDF}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="edit">
            Form
          </TabsTrigger>

          <TabsTrigger value="preview">
            Markdown
          </TabsTrigger>
        </TabsList>

        {/* FORM */}
        <TabsContent value="edit">
          <form className="space-y-8">
            {/* NAME */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Full Name
              </h3>

              <div className="p-4 border rounded-lg bg-muted/50">
                <Input
                  {...register("fullName")}
                  placeholder="e.g. Rida Fatima"
                />
              </div>
            </div>

            {/* CONTACT */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <Input
                  {...register(
                    "contactInfo.email"
                  )}
                  placeholder="Email"
                />

                <Input
                  {...register(
                    "contactInfo.mobile"
                  )}
                  placeholder="Mobile"
                />

                <Input
                  {...register(
                    "contactInfo.linkedin"
                  )}
                  placeholder="LinkedIn URL"
                />

                <Input
                  {...register(
                    "contactInfo.twitter"
                  )}
                  placeholder="Twitter URL"
                />
              </div>
            </div>

            {/* SUMMARY */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Professional Summary
              </h3>

              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write your summary..."
                  />
                )}
              />
            </div>

            {/* SKILLS */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Skills
              </h3>

              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Add skills..."
                  />
                )}
              />
            </div>

            {/* EXPERIENCE */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Work Experience
              </h3>

              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                    }}
                  />
                )}
              />
            </div>

            {/* EDUCATION */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Education
              </h3>

              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* PROJECTS */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Projects
              </h3>

              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </form>
        </TabsContent>

        {/* MARKDOWN */}
        <TabsContent value="preview">
          <Button
            variant="link"
            type="button"
            className="mb-2"
            onClick={() =>
              setResumeMode(
                resumeMode === "preview"
                  ? "edit"
                  : "preview"
              )
            }
          >
            {resumeMode === "preview" ? (
              <>
                <Edit className="h-4 w-4 mr-1" />
                Edit Resume
              </>
            ) : (
              <>
                <Monitor className="h-4 w-4 mr-1" />
                Show Preview
              </>
            )}
          </Button>

          {resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />

              <span className="text-sm">
                You will lose edited markdown
                if you update the form data.
              </span>
            </div>
          )}

          <div
            className="border rounded-xl overflow-hidden shadow-sm bg-white"
            style={{
              fontFamily:
                "Inter, Arial, sans-serif",
            }}
          >
            <MDEditor
              value={previewContent}
              onChange={(val) => {
                isUserEditingRef.current = true;
                setPreviewContent(val);
              }}
              height={800}
              preview={resumeMode}
              textareaProps={{
                placeholder:
                  "Write or edit your resume markdown here...",
                style: {
                  fontSize: 15,
                  lineHeight: 1.8,
                  fontFamily:
                    "Inter, Arial, sans-serif",
                  padding: 20,
                },
              }}
              previewOptions={{
                className:
                  "prose max-w-none p-6",
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}