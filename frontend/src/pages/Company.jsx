import React, { useEffect, useState,useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import Selector from '../components/Topic_Company_wise/Selector';
import FiltersAndSorting from '../components/Topic_Company_wise/FiltersAndSorting';
import ProgressBar from '../components/Topic_Company_wise/ProgressBar';
import QuestionCard from '../components/Topic_Company_wise/QuesCard';
import API from '../api/axios';
import TcSkeleton from '../skeleton/tcSkeleton';

export default function Company() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState([]);

  const selectedCompany = searchParams.get('company') || 'Amazon';
  const statusFilter = searchParams.get('status') || null;
  const difficultyFilter = searchParams.get('difficulty') || null;

const companies = [
  "Amazon",
  "Adobe",
  "Google",
  "Apple",
  "Microsoft",
  "Facebook",
  "Bloomberg",
  "Uber",
  "Spotify",
  "Expedia",
  "Oracle",
  "Yahoo",
  "Zoho",
  "Visa",
  "Paypal",
  "Intel",
  "Salesforce",
  "Samsung",
  "Intuit",
  "Zillow",
  "Ebay",
  "Alibaba",
  "Affirm",
  "Huawei",
  "Morgan-stanley",
  "Ibm",
  "Linkedin",
  "Bytedance",
  "Lyft",
  "Snapchat",
  "Godaddy",
  "Tencent",
  "Wish",
  "Vmware",
  "Sap",
  "Yandex",
  "Twitter",
  "Audible",
  "Factset",
  "Tableau",
  "Groupon",
  "Citadel",
  "Goldman-sachs",
  "Twilio",
  "Cloudera",
  "Servicenow",
  "Indeed",
  "Didi",
  "Mathworks",
  "Jpmorgan",
  "Cisco",
  "Quora",
  "Yelp",
  "Nvidia",
  "Roblox",
  "Splunk",
  "Qualcomm",
  "Box",
  "Dropbox",
  "Blackrock",
  "Airbnb",
  "Redfin",
  "Flipkart",
  "Docusign",
  "Grab",
  "Capital-one",
  "Coupang",
  "Twitch",
  "Atlassian",
  "Two-sigma",
  "Zulily",
  "Houzz",
  "Nutanix",
  "Wayfair",
  "Pure-storage",
  "Appdynamics",
  "Barclays",
  "Coursera",
  "Databricks",
  "Palantir-technologies",
  "Pocket-gems",
  "Qualtrics",
  "Ixl",
  "Pinterest",
  "Tesla",
  "Citrix",
  "Doordash",
  "Square",
  "Akuna-capital",
  "Postmates",
  "Quip",
  "Netflix",
  "Liveramp",
  "Epic-systems",
  "Arista-networks",
  "Cruise-automation",
  "Cohesity",
  "Hulu",
  "Tripadvisor",
  "Reddit",
  "Electronic-arts",
  "Asana",
  "Robinhood"
];

  const setParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    const controller = new AbortController();
    
    const company = selectedCompany;
    const cacheKey = `company_${company}`;
    const cacheTimeKey = `${cacheKey}_time`;

    const cached = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(cacheTimeKey);
    const isFresh = cachedTime && dayjs().diff(dayjs(cachedTime), 'minute') < 1;

    if (cached && isFresh) {
      try {
        const parsed = JSON.parse(cached);
        setResponse(parsed);
        setAllQuestions(parsed.questions);
        setLoading(false);
        return;
      } catch (err) {
        console.error("Failed to parse cache", err);
        sessionStorage.removeItem(cacheKey);
        sessionStorage.removeItem(cacheTimeKey);
      }
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        const endpoint = `/companies/${company}`;
        const res = await API.get(endpoint, { signal: controller.signal });

        setResponse(res.data.statusCode);
        setAllQuestions(res.data.statusCode.questions);

        sessionStorage.setItem(cacheKey, JSON.stringify(res.data.statusCode));
        sessionStorage.setItem(cacheTimeKey, dayjs().toISOString());
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error("Error fetching stats:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    return () => controller.abort();
  }, [selectedCompany]);

  const filteredQuestions = useMemo(() => {
    
    if (!allQuestions || !Array.isArray(allQuestions)) return [];
    // console.log("All questions:", allQuestions.length);
      // console.log("Filtering questions:", { statusFilter, difficultyFilter });

      let filtered = [...allQuestions];
      // console.log(filtered.length, "questions before filtering");
    
      if (statusFilter) {
        filtered = filtered.filter((q) =>
          statusFilter === "solved" ? q.solved === true : q.solved === false
        );
      }
      // console.log(filtered.length, "questions after status filter");
      
      if (difficultyFilter) {
        filtered = filtered.filter((q) => q.difficulty === difficultyFilter);
      }
      // console.log(filtered.length, "questions after difficulty filter");
  
      return filtered;
    }, [allQuestions, statusFilter, difficultyFilter]);


  return (
    <div className="p-6 bg-[#0f0f1c] min-h-screen flex gap-6">
      <div className="w-64 shrink-0">
        <Selector
          topics={companies}
          selectedTopic={selectedCompany}
          onSelect={(company) => setParam('company', company)}
        />
      </div>
      {!loading && response ? (

        <div className="flex-1 mt-8">
          <h1 className="text-3xl pl-2 font-bold text-white mb-6">{selectedCompany}</h1>

          <ProgressBar
            topic="Progress"
            completed={response.solvedCount}
            total={response.total}
          />

          <FiltersAndSorting
            statusFilter={statusFilter}
            setStatusFilter={(status) => setParam('status', status)}
            difficultyFilter={difficultyFilter}
            setDifficultyFilter={(difficulty) => setParam('difficulty', difficulty)}
            onSelect={(company) => setParam('company', company)}
          />

          <div className="mt-6 h-[70vh] overflow-y-auto flex flex-col gap-4">
            {Array.isArray(filteredQuestions) && filteredQuestions.length > 0 ? (  
              filteredQuestions.map((q) => (
                <QuestionCard
                  key={q.Qid}
                  Qid={q.Qid}
                  title={q.title}
                  slug={q.slug}
                  difficulty={q.difficulty}
                  solved={q.solved}
                  topics={q.topics}
                  companyTags={q.companyTags}
                />
              ))
            ): (
              <p className="text-white">No questions found.</p>
            )}
          </div>
        </div>
      ):(
        <TcSkeleton />
      )}
    </div>
  );
}