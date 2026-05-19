"use client";
import HomeButton from "@/components/HomeButton";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
  Plus,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DashboardView = ({ insights }) => {
  const router = useRouter();


  // STATE
  const [showInput, setShowInput] = useState(false);
  const [skill, setSkill] = useState("");
  const [customInsights, setCustomInsights] = useState(null);

  // ✅ FIXED ANALYZE FUNCTION
  const handleAnalyze = () => {
    const updatedData = {
      ...insights,

      marketOutlook: "Positive",
      growthRate: 60 + Math.random() * 30,
      demandLevel: "High",

      // ✅ PKR SALARY DATA
      salaryRanges: [
        {
          role: `${skill} Junior`,
          min: 50000,
          median: 80000,
          max: 120000,
        },
        {
          role: `${skill} Mid`,
          min: 120000,
          median: 180000,
          max: 250000,
        },
        {
          role: `${skill} Senior`,
          min: 250000,
          median: 400000,
          max: 600000,
        },
      ],

      // ✅ TOP SKILLS
      topSkills: [
        skill,
        "AI",
        "Cloud",
        "Data Analysis",
        "Freelancing",
      ],

      // ✅ TRENDS (NOT WIPED)
      keyTrends: [
        `${skill} demand is increasing in Pakistan`,
        `Companies are hiring more ${skill} professionals`,
        `${skill} freelance market is growing`,
      ],

      // ✅ RECOMMENDED SKILLS (NOT WIPED)
      recommendedSkills: [
        `Advanced ${skill}`,
        "Communication",
        "Problem Solving",
        "Team Collaboration",
        "Git & Tools",
      ],

      lastUpdated: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setCustomInsights(updatedData);
    setShowInput(false);
  };

  const activeInsights = customInsights || insights;

  const salaryData = activeInsights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));

  const getDemandLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" };
      case "neutral":
        return { icon: LineChart, color: "text-yellow-500" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" };
      default:
        return { icon: LineChart, color: "text-gray-500" };
    }
  };

  const OutlookIcon = getMarketOutlookInfo(activeInsights.marketOutlook).icon;
  const outlookColor = getMarketOutlookInfo(activeInsights.marketOutlook).color;

  const lastUpdatedDate = format(
    new Date(activeInsights.lastUpdated),
    "dd/MM/yyyy"
  );
  const nextUpdateDistance = formatDistanceToNow(
    new Date(activeInsights.nextUpdate),
    { addSuffix: true }
  );

  return (
    <div className="space-y-6">
      
      <h1 className="text-3xl font-bold mb-4">Industry Insights</h1>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Badge variant="outline">
          Last updated: {lastUpdatedDate}
        </Badge>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Skill
          </Button>
        </div>
      </div>

      {/* INPUT BOX */}
      {showInput && (
        <Card>
          <CardHeader>
            <CardTitle>Add a New Skill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter skill (e.g. React, AI, Marketing)"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            />
            <Button onClick={handleAnalyze}>
              Analyze Skill
            </Button>
          </CardContent>
        </Card>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Market Outlook</CardTitle>
            <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeInsights.marketOutlook}
            </div>
            <p className="text-xs text-muted-foreground">
              Next update {nextUpdateDistance}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeInsights.growthRate.toFixed(1)}%
            </div>
            <Progress value={activeInsights.growthRate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demand Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeInsights.demandLevel}
            </div>
            <div
              className={`h-2 mt-2 ${getDemandLevelColor(
                activeInsights.demandLevel
              )}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1">
            {activeInsights.topSkills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* SALARY CHART */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Ranges (PKR)</CardTitle>
          <CardDescription>
            Min / Median / Max salaries (in thousands)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `${v}K PKR`} />
                <Tooltip formatter={(v) => `${v}K PKR`} />
                <Bar dataKey="min" fill="#3b82f6" name="Min" />
                <Bar dataKey="median" fill="#8b5cf6" name="Median" />
                <Bar dataKey="max" fill="#ec4899" name="Max" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* TRENDS + SKILLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Card>
          <CardHeader>
            <CardTitle>Key Industry Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {activeInsights.keyTrends.map((trend, index) => (
                <li key={index} className="flex gap-2">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <span className="text-sm">{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activeInsights.recommendedSkills.map((skillItem) => (
                <Badge key={skillItem} variant="outline">
                  {skillItem}
                </Badge>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowInput(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Analyze Another Skill
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default DashboardView;
