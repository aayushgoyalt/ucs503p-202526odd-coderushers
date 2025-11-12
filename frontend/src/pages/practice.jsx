import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import API from "../api/axios";
import OASession from "../components/OA/OASession";
import OAResults from "../components/OA/OAResults";
import toast, { Toaster } from "react-hot-toast";

// Practice page: fetch OA status and render accordingly
export default function PracticePage() {
	const [loading, setLoading] = useState(true);
	const [activeOA, setActiveOA] = useState(null); // null = no active OA
	const [error, setError] = useState(null);

	// Hardcoded timer placeholder for now
	const hardcodedTimer = "01:30:00";

	useEffect(() => {
		let mounted = true;
		const controller = new AbortController();

		const loadStatus = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await API.get("/oa/status-h", {
					signal: controller.signal,
				});

				if (res.status === 204) {
					if (mounted) setActiveOA(null);
					if (mounted) setLoading(false);
					return;
				}

				let payload = null;

				if (res?.data?.statusCode && typeof res.data.statusCode === "object") {
					payload = res.data.statusCode;
				} else if (res?.data?.data && typeof res.data.data === "object") {
					payload = res.data.data;
				} else if (res?.data && typeof res.data === "object" && res.data.oaId) {
					payload = res.data;
				}

				if (!payload) {
					if (mounted) setActiveOA(null);
				} else {
					const oa = payload.oaId ? payload : payload.data ?? payload;
					if (oa.status === "ongoing" || oa.oaId) {
						if (mounted) setActiveOA(oa);
					} else {
						if (mounted) setActiveOA(null);
					}
				}
			} catch (err) {
				console.warn("Failed to load /oa/status-h", err);
				if (mounted) {
					setActiveOA(null);
					setError(err?.message || "Failed to fetch OA status");
				}
			} finally {
				if (mounted) setLoading(false);
			}
		};

		loadStatus();
		return () => {
			mounted = false;
			controller.abort();
		};
	}, []);

	const [remaining, setRemaining] = React.useState(hardcodedTimer);

	React.useEffect(() => {
		let id = null;
		if (activeOA && activeOA.endsAt) {
			const update = () => {
				const diff = new Date(activeOA.endsAt) - new Date();
				if (diff <= 0) {
					setRemaining("00:00:00");
					clearInterval(id);
					return;
				}
				const total = Math.max(0, diff);
				const sec = Math.floor(total / 1000);
				const hh = String(Math.floor(sec / 3600)).padStart(2, "0");
				const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
				const ss = String(sec % 60).padStart(2, "0");
				setRemaining(`${hh}:${mm}:${ss}`);
			};
			update();
			id = setInterval(update, 1000);
		} else {
			setRemaining(hardcodedTimer);
		}
		return () => {
			if (id) clearInterval(id);
		};
	}, [activeOA]);

	return (
		<div className="p-6 bg-[#0f0f1c] min-h-screen">
			<Toaster position="top-right" reverseOrder={false} />
			<div className="max-w-3xl mx-auto space-y-6">
				
				{/* Banner */}
				<div className="rounded-2xl bg-[#181825] text-white p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold">Online Assessment</h2>

						<p className="mt-1 text-sm text-gray-300">
							{activeOA
								? "An OA is in progress — continue your assessment."
								: "Start a fresh OA — 4 curated DSA questions (90 mins)."}
						</p>
					</div>

					<div className="flex items-center gap-4">
						{activeOA ? (
							<>
								<div className="flex items-center gap-3">
									<span className="w-3 h-3 rounded-full bg-green-400 animate-pulse block" />
									<div className="text-sm">OA in progress</div>
								</div>

								<button
									onClick={async () => {
										if (!window.confirm("Are you sure you want to abort this OA?")) return;
										try {
											toast.loading("Ending OA...");
											await API.post("/oa/end");
											toast.dismiss();
											toast.success("OA ended");
											setTimeout(() => window.location.reload(), 1000);
										} catch (err) {
											console.error("Failed to end OA", err);
											toast.dismiss();
											toast.error("Failed to end OA. Please try again.");
										}
									}}
									className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold shadow-md"
								>
									End OA
								</button>
							</>
						) : (
							<button
								onClick={async () => {
									try {
										toast.loading("Creating OA...");
										await API.post("/oa/create");
										toast.dismiss();
										toast.success("OA created! Redirecting...");
										setTimeout(() => window.location.reload(), 1000);
									} catch (err) {
										console.error("Failed to start OA", err);
										toast.dismiss();
										toast.error("Failed to start OA. Please try again.");
									}
								}}
								className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 rounded-lg text-white font-semibold shadow-md"
							>
								Start OA
							</button>
						)}
					</div>
				</div>

				{/* Active or Results */}
				{loading ? (
					<div className="p-6 text-gray-300">Loading status...</div>
				) : activeOA ? (
					activeOA.status === "ongoing" ? (
						<OASession activeOA={activeOA} onEnd={() => window.location.reload()} />
					) : (
						<OAResults activeOA={activeOA} />
					)
				) : (
					// No active OA: Only DSA instructions now
					<div className="p-4 bg-[#14141f] rounded-xl">
						<h4 className="text-sm text-gray-400 mb-3">Instructions</h4>

						<div className="text-sm text-gray-300 space-y-3">
							<div>
								<h5 className="font-semibold text-white mb-2">💻 DSA Section (90 minutes)</h5>
								<ul className="list-disc pl-5 space-y-1">
									<li>You will receive 4 curated DSA questions</li>
									<li>Questions come from LeetCode (auto-open supported)</li>
									<li>Mark completion inside the OA panel</li>
									<li>Total OA duration: 90 minutes</li>
								</ul>
							</div>
						</div>
					</div>
				)}

				{error && (
					<div className="text-sm text-red-400">{String(error)}</div>
				)}
			</div>
		</div>
	);
}