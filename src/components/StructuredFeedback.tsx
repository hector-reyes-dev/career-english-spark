import { useState } from "react";
import { ChevronDown, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedbackItem {
  text: string;
  isPositive: boolean;
}

interface StructuredFeedbackData {
  structure: FeedbackItem[];
  vocabulary: FeedbackItem[];
  grammar: FeedbackItem[];
}

interface StructuredFeedbackProps {
  feedback: string;
}

export const StructuredFeedback = ({ feedback }: StructuredFeedbackProps) => {
  const [activeTab, setActiveTab] = useState<'structure' | 'vocabulary' | 'grammar'>('structure');
  const [isExpanded, setIsExpanded] = useState(false);

  let structuredData: StructuredFeedbackData;
  
  try {
    structuredData = JSON.parse(feedback);
  } catch (error) {
    // Fallback if feedback is not structured
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-green-800">
            AI Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-800 leading-relaxed">{feedback}</p>
        </CardContent>
      </Card>
    );
  }

  const tabs = [
    { key: 'structure' as const, label: 'Structure', data: structuredData.structure },
    { key: 'vocabulary' as const, label: 'Vocabulary', data: structuredData.vocabulary },
    { key: 'grammar' as const, label: 'Grammar', data: structuredData.grammar },
  ];

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="pb-4">
        <CardTitle 
          className="flex items-center justify-between text-xl text-gray-800 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>Feedback</span>
          <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Feedback Content */}
          <div className="space-y-3">
            {tabs.find(tab => tab.key === activeTab)?.data.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                {item.isPositive ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <p className={`text-sm leading-relaxed ${
                  item.isPositive ? 'text-gray-700' : 'text-gray-700'
                }`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};