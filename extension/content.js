
(async () => {
  console.log("✅ LeetCode OA Tracker initialized.");

  async function getUsername() {
    const query = `
      query globalData {
        user {
          username
        }
      }
    `;
    try {
      const res = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      const username = data?.data?.user?.username;
      if (!username) console.warn("⚠️ Could not fetch username");
      else console.log("👤 LeetCode user:", username);
      return username || "unknown_user";
    } catch (err) {
      console.error("❌ Error fetching username:", err);
      return "unknown_user";
    }
  }


  async function getQuestionId(slug) {
    const query = `
      query getQuestionDetail($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionFrontendId
        }
      }
    `;
    try {
      const res = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          variables: { titleSlug: slug },
        }),
      });
      const data = await res.json();
      return data?.data?.question?.questionFrontendId || null;
    } catch (err) {
      console.error("❌ Error fetching question ID:", err);
      return null;
    }
  }


  async function sendToBackend(payload) {
    try {
      const res = await fetch("https://ucs503p-202526odd-group6/api/oa/submit.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("📡 Sent to backend:", await res.text());
    } catch (err) {
      console.error("❌ Error sending to backend:", err);
    }
  }


  async function listenForSubmit() {
    const submitBtn = document.querySelector('button[data-e2e-locator="console-submit-button"]');

    if (!submitBtn) {
      setTimeout(listenForSubmit, 2000);
      return;
    }

    const username = await getUsername();

    submitBtn.addEventListener("click", async () => {
      console.log("🟢 Submit button clicked, tracking submission...");

      const slug = window.location.pathname.split("/")[2];
      const qid = await getQuestionId(slug);

      const payload = {
        username,
        qid: qid || slug,
        completed_on: new Date().toISOString(),
      };

      console.log("➡️ Sending payload:", payload);
      await sendToBackend(payload);
    });

    console.log("👂 Listening for LeetCode submissions...");
  }

  listenForSubmit();
})();