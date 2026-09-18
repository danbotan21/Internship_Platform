import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft, Users, Mail, Phone, GraduationCap, FileText,
  Download, CheckCircle, MessageSquare, Leaf, Code2, BarChart3,
  CheckCircle2, MapPin, Briefcase, Calendar, X,
} from "lucide-react"

interface ApplicantFile { name: string; size: string; type: string }
interface Applicant {
  id: string; firstName: string; lastName: string
  email: string; phone: string; educationLevel: string; fieldOfStudy: string
  expectedGraduation: string; availability: string; motivation: string
  appliedDate: string; status: "Under Review" | "Accepted" | "Rejected" | "Pending"
  files: ApplicantFile[]; avatar: string
}
interface MentorOpp {
  id: string; title: string; company: string
  location: string; type: string; duration: string
  logoBg: string; logoType: "leaf" | "code" | "chart" | "check"
}

const MOCK_OPPS: Record<string, MentorOpp> = {
  "1": { id:"1", title:"Software Development Intern", company:"GreenTech Solutions", location:"Chișinău, MD", type:"Full-time", duration:"3-6 months", logoBg:"bg-[#1b5e3a]", logoType:"leaf" },
  "2": { id:"2", title:"Frontend Intern", company:"TechVision", location:"Remote", type:"Full-time", duration:"3 months", logoBg:"bg-[#2563eb]", logoType:"code" },
  "3": { id:"3", title:"Data Analytics Intern", company:"NextGen Analytics", location:"Chișinău, MD", type:"Full-time", duration:"6 months", logoBg:"bg-[#0f172a]", logoType:"chart" },
  "4": { id:"4", title:"QA Automation Intern", company:"AlphaSystems", location:"Remote", type:"Part-time", duration:"3 months", logoBg:"bg-[#ea580c]", logoType:"check" },
  "5": { id:"5", title:"Technical Writing Intern", company:"GreenTech Solutions", location:"Remote", type:"Part-time", duration:"2 months", logoBg:"bg-gray-600", logoType:"code" },
  "6": { id:"6", title:"Sustainability Research Intern", company:"GreenTech Solutions", location:"Chișinău, MD", type:"Full-time", duration:"4 months", logoBg:"bg-[#1b5e3a]", logoType:"leaf" },
  "7": { id:"7", title:"Business Analysis Intern", company:"NextGen Analytics", location:"Remote", type:"Full-time", duration:"3-6 months", logoBg:"bg-[#0f172a]", logoType:"chart" },
  "8": { id:"8", title:"Marketing Intern", company:"TechVision", location:"Chișinău, MD", type:"Part-time", duration:"2-3 months", logoBg:"bg-[#ea580c]", logoType:"check" },
}

const MOCK_APPLICANTS: Record<string, Applicant> = {
  "a1": { id:"a1", firstName:"Daniel", lastName:"Chitanu", email:"daniel.chitanu@gmail.com", phone:"+373 68 123 456", educationLevel:"Bachelor Degree", fieldOfStudy:"Computer Science", expectedGraduation:"June 2026", availability:"Full-time", motivation:"I am passionate about software development and want to gain hands-on experience in a company that builds innovative and sustainable solutions.", appliedDate:"Sep 15, 2026", status:"Under Review", avatar:"bg-[#1b5e3a]", files:[{name:"Resume_Daniel_Chitanu.pdf",size:"245 KB",type:"PDF"},{name:"Cover_Letter.pdf",size:"180 KB",type:"PDF"},{name:"Transcript.pdf",size:"350 KB",type:"PDF"}] },
  "a2": { id:"a2", firstName:"Maria", lastName:"Ionescu", email:"maria.ionescu@student.utm.md", phone:"+373 79 456 789", educationLevel:"Master Degree", fieldOfStudy:"Software Engineering", expectedGraduation:"January 2027", availability:"Part-time", motivation:"With a strong background in software engineering and a genuine interest in building scalable applications, I am eager to contribute to your team.", appliedDate:"Sep 14, 2026", status:"Accepted", avatar:"bg-[#2563eb]", files:[{name:"Maria_Ionescu_CV.pdf",size:"312 KB",type:"PDF"},{name:"Portfolio_Links.pdf",size:"95 KB",type:"PDF"}] },
  "a3": { id:"a3", firstName:"Alexandru", lastName:"Moraru", email:"alex.moraru@mail.com", phone:"+373 60 789 012", educationLevel:"Bachelor Degree", fieldOfStudy:"Information Technology", expectedGraduation:"July 2026", availability:"Full-time", motivation:"I have been following the company work for over a year and deeply admire the focus on sustainability.", appliedDate:"Sep 13, 2026", status:"Pending", avatar:"bg-[#ea580c]", files:[{name:"CV_Alexandru_Moraru.pdf",size:"198 KB",type:"PDF"},{name:"Cover_Letter_AlexMoraru.pdf",size:"155 KB",type:"PDF"},{name:"Recommendation_Letter.pdf",size:"420 KB",type:"PDF"}] },
  "a4": { id:"a4", firstName:"Elena", lastName:"Popescu", email:"elena.popescu@techuni.md", phone:"+373 69 321 654", educationLevel:"Bachelor Degree", fieldOfStudy:"Computer Engineering", expectedGraduation:"May 2026", availability:"Full-time", motivation:"As a driven student with hands-on project experience in React and TypeScript, I am confident I can contribute to your frontend team from day one.", appliedDate:"Sep 12, 2026", status:"Rejected", avatar:"bg-[#0f172a]", files:[{name:"Elena_Popescu_Resume.pdf",size:"267 KB",type:"PDF"},{name:"GitHub_Portfolio.pdf",size:"88 KB",type:"PDF"}] },
  "a5": { id:"a5", firstName:"Andrei", lastName:"Vacaru", email:"andrei.vacaru@gmail.com", phone:"+373 62 654 321", educationLevel:"Bachelor Degree", fieldOfStudy:"Mathematics and Informatics", expectedGraduation:"September 2026", availability:"Full-time", motivation:"I have a strong foundation in algorithms and data structures, and I have built several personal projects using modern frameworks.", appliedDate:"Sep 10, 2026", status:"Under Review", avatar:"bg-purple-600", files:[{name:"Andrei_Vacaru_CV.pdf",size:"302 KB",type:"PDF"},{name:"Transcript_2026.pdf",size:"410 KB",type:"PDF"}] },
}

const STATUS_OPTIONS = [
  { value:"Under Review" as const, label:"Under Review", bg:"bg-amber-50",   text:"text-amber-700",   border:"border-amber-300",   dot:"bg-amber-500"   },
  { value:"Accepted"     as const, label:"Accepted",     bg:"bg-emerald-50", text:"text-emerald-700", border:"border-emerald-400", dot:"bg-emerald-600" },
  { value:"Rejected"     as const, label:"Rejected",     bg:"bg-red-50",     text:"text-red-600",     border:"border-red-300",     dot:"bg-red-500"     },
]

function LogoIcon({ type, cls = "w-5 h-5" }: { type: string; cls?: string }) {
  if (type === "leaf")  return <Leaf className={cls} />
  if (type === "code")  return <Code2 className={cls} />
  if (type === "chart") return <BarChart3 className={cls} />
  return <CheckCircle2 className={cls} />
}

export default function ApplicantReview() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const oppId  = searchParams.get("oppId")  || "1"
  const userId = searchParams.get("userId") || "a1"

  const opp       = MOCK_OPPS[oppId]       ?? MOCK_OPPS["1"]
  const applicant = MOCK_APPLICANTS[userId] ?? MOCK_APPLICANTS["a1"]

  const [feedback, setFeedback]             = useState("")
  const [selectedStatus, setSelectedStatus] = useState<Applicant["status"]>(applicant.status === "Pending" ? "Under Review" : applicant.status)
  const [previewFile, setPreviewFile]       = useState<ApplicantFile | null>(null)
  const [isSubmitted, setIsSubmitted]       = useState(false)

  if (isSubmitted) {
    const chosen = STATUS_OPTIONS.find((s) => s.value === selectedStatus)!
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#0c382b]">Review Submitted!</h1>
          <p className="text-gray-600 max-w-lg mx-auto text-sm sm:text-base">
            The application from{" "}
            <span className="font-semibold text-gray-900">{applicant.firstName} {applicant.lastName}</span>{" "}
            has been marked as{" "}
            <span className={`font-semibold ${chosen.text}`}>{chosen.label}</span>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/my-opportunities/applications?id=${oppId}`)}
          className="bg-[#ff5500] hover:bg-[#e64d00] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/my-opportunities/applications?id=${oppId}`)}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Applications
      </button>

      <div className="bg-white border border-gray-200/80 rounded-2xl px-5 py-4 shadow-xs flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${opp.logoBg} flex items-center justify-center text-white shrink-0 shadow-xs`}>
          <LogoIcon type={opp.logoType} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-snug truncate">{opp.title}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium mt-0.5">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{opp.location}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{opp.type}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{opp.duration}</span>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#0c382b]">Applicant Review</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Review and submit your decision for{" "}
          <span className="font-semibold text-gray-800">{applicant.firstName} {applicant.lastName}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: Student Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full ${applicant.avatar} flex items-center justify-center text-white text-xl font-bold shrink-0`}>
                {applicant.firstName[0]}{applicant.lastName[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{applicant.firstName} {applicant.lastName}</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Applied {applicant.appliedDate}</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Personal Information
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-gray-700">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="font-medium">{applicant.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-700">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="font-medium">{applicant.phone}</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Education
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><p className="text-gray-400 font-medium mb-0.5">Level</p><p className="font-semibold text-gray-800">{applicant.educationLevel}</p></div>
                <div><p className="text-gray-400 font-medium mb-0.5">Field of Study</p><p className="font-semibold text-gray-800">{applicant.fieldOfStudy}</p></div>
                <div><p className="text-gray-400 font-medium mb-0.5">Graduation</p><p className="font-semibold text-gray-800">{applicant.expectedGraduation}</p></div>
                <div><p className="text-gray-400 font-medium mb-0.5">Availability</p><p className="font-semibold text-gray-800">{applicant.availability}</p></div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Motivation</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{applicant.motivation}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Submitted Documents
            </h3>
            <div className="space-y-2">
              {applicant.files.map((file, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200/70 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">{file.type}</span>
                    <span className="font-semibold text-gray-800 truncate">{file.name}</span>
                    <span className="text-gray-400 shrink-0">{file.size}</span>
                  </div>
                  <button type="button" onClick={() => setPreviewFile(file)}
                    className="flex items-center gap-1.5 text-[#1b5e3a] font-semibold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ml-2">
                    <Download className="w-3.5 h-3.5" />Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Mentor Review Panel */}
        <div className="lg:col-span-7 space-y-4">

          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#ff5500]" />
              <h3 className="text-sm font-bold text-gray-900">Mentor Feedback</h3>
            </div>
            <p className="text-xs text-gray-500">
              Write your notes or feedback for this applicant. This message will be visible to the student once you submit your review.
            </p>
            <textarea
              rows={7}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Thank you for applying. We were impressed by your experience in React and TypeScript..."
              className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#ff5500] focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition-all resize-none leading-relaxed"
            />
            <div className="flex justify-end">
              <span className={`text-[11px] font-medium ${feedback.length > 800 ? "text-red-500" : "text-gray-400"}`}>
                {feedback.length} / 1000
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Application Decision</h3>
              <p className="text-xs text-gray-500 mt-0.5">Select the status to assign to this applicant.</p>
            </div>
            <div className="space-y-2.5">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = selectedStatus === opt.value
                return (
                  <button key={opt.value} type="button" onClick={() => setSelectedStatus(opt.value)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      isSelected ? `${opt.bg} ${opt.border} shadow-sm` : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? `${opt.border} ${opt.bg}` : "border-gray-300"
                    }`}>
                      {isSelected && <div className={`w-2 h-2 rounded-full ${opt.dot}`} />}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                      <span className={`text-sm font-semibold ${isSelected ? opt.text : "text-gray-700"}`}>{opt.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 className={`w-4 h-4 shrink-0 ${opt.text}`} />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-gray-500 space-y-0.5">
              <p className="font-semibold text-gray-700">Ready to submit?</p>
              <p>This will notify the applicant with your feedback and decision.</p>
            </div>
            <button type="button" onClick={() => setIsSubmitted(true)}
              className="bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs shrink-0 w-full sm:w-auto justify-center">
              <CheckCircle className="w-4 h-4" />
              Submit Review
            </button>
          </div>
        </div>
      </div>

      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Download File</h3>
              <button type="button" onClick={() => setPreviewFile(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{previewFile.type}</span>
              <div><p className="text-xs font-semibold text-gray-800">{previewFile.name}</p><p className="text-xs text-gray-400">{previewFile.size}</p></div>
            </div>
            <p className="text-xs text-gray-500">In a real application this would trigger a secure download from the server.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setPreviewFile(null)} className="px-4 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button type="button" onClick={() => setPreviewFile(null)} className="px-4 py-2 text-xs font-semibold text-white bg-[#1b5e3a] hover:bg-[#154d2f] rounded-xl flex items-center gap-2 cursor-pointer">
                <Download className="w-3.5 h-3.5" />Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
