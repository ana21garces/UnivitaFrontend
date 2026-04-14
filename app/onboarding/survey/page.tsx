"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, ChevronUp, Send } from "lucide-react";
import { UniVitaLogo } from "@/components/univita-logo";
import axios from "axios";
import {
  QUESTIONS,
  LIKERT_LABELS,
  calculateSubscaleScores,
  buildSurveyPayload,
} from "@/lib/survey-data";

import Select from "react-select";

type Sexo = "masculino" | "femenino" | null;

const TOTAL_QUESTIONS = QUESTIONS.length;
const QUESTIONS_PER_PAGE = 8;
const TOTAL_PAGES = Math.ceil(TOTAL_QUESTIONS / QUESTIONS_PER_PAGE);

export default function OnboardingSurveyPage() {
  const router = useRouter();

  // Demographics
  const [sexo, setSexo] = useState<Sexo>(null);

  const facultades = {
    "Ciencias de la Salud": [
      "Enfermería",
      "Tecnología en atención prehospitalaria",
    ],
    Ingeniería: ["Ingeniería industrial", "Ingeniería de sistemas"],
    "Ciencias Administrativas y Contables": [
      "Administración de empresas",
      "Contaduría pública",
      "Marketing y comunicación digital",
    ],
    "Ciencias Humanas y de la Educación": [
      "Licenciatura en español e inglés",
      "Licenciatura en educación infantil",
      "Licenciatura en música",
    ],
    "Teología y Religión": ["Teología", "Licenciatura en educación religiosa"],
  } as const;

  const [facultad, setFacultad] = useState<string>("");
  const [programa, setPrograma] = useState<string>("");
  const [tipoUsuario, setTipoUsuario] = useState<string>("");

  const handleFacultadChange = (value: string) => {
    setFacultad(value);
    setPrograma(""); // 🔥 reset automático
  };

  const facultadOptions = Object.keys(facultades).map((fac) => ({
    value: fac,
    label: fac,
  }));

  const programaOptions = facultad
    ? facultades[facultad as keyof typeof facultades].map((prog) => ({
        value: prog,
        label: prog,
      }))
    : [];

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: "10px",
      borderColor: state.isFocused ? "#16A34A" : "#E2E8F0",
      boxShadow: state.isFocused ? "0 0 0 2px #DCFCE7" : "none",
      "&:hover": {
        borderColor: "#16A34A",
      },
      padding: "2px",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#16A34A"
        : state.isFocused
          ? "#F0FDF4"
          : "white",
      color: state.isSelected ? "white" : "#1F2937",
      cursor: "pointer",
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: "10px",
      overflow: "hidden",
    }),
  };

  // Answers: key = 1-based question index, value = 1-4
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // UI state
  const [currentPage, setCurrentPage] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const handleAnswer = useCallback((qIndex: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  }, []);

  // Which questions are on the current page
  const pageStart = currentPage * QUESTIONS_PER_PAGE;
  const pageEnd = Math.min(pageStart + QUESTIONS_PER_PAGE, TOTAL_QUESTIONS);
  const pageQuestions = Array.from(
    { length: pageEnd - pageStart },
    (_, i) => pageStart + i + 1, // 1-based
  );

  // Validation
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);
  const allDemographicsFilled =
    sexo !== null && facultad !== "" && programa !== "" && tipoUsuario !== "";
  const allQuestionsFilled = answeredCount === TOTAL_QUESTIONS;
  const canSubmit = allDemographicsFilled && allQuestionsFilled;

  // Unanswered on current page
  const unansweredOnPage = pageQuestions.filter(
    (q) => answers[q] === undefined,
  );

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNextPage = () => {
    if (currentPage === 0 && !allDemographicsFilled) {
      setShowErrors(true);
      return;
    }

    if (unansweredOnPage.length > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (currentPage < TOTAL_PAGES - 1) {
      setCurrentPage((p) => p + 1);
      scrollToTop();
    }
  };

  const handlePrevPage = () => {
    setShowErrors(false);
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
      scrollToTop();
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setShowErrors(true);
      return;
    }
    setSubmitting(true);

    try {
      const payload = buildSurveyPayload(answers);

      const token = localStorage.getItem("access_token");

      const { data } = await axios.post(`${API_URL}/encuesta`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("Respuesta backend:", data);

      console.log("lo que envio:", payload);

      router.push("/dashboard/user");
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const isLastPage = currentPage === TOTAL_PAGES - 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC]" ref={topRef}>
      {/* Sticky header: logo + progress + legend */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          {/* Top row: brand + progress */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <UniVitaLogo size="sm" />
              <div>
                <h1 className="text-2xl font-bold font-heading text-[#1F2937] leading-tight">
                  Encuesta de Estilo de Vida
                </h1>
                <p className="text-[10px] text-[#6B7280] leading-none mt-0.5">
                  VitalUNAC -- Health Profile
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#16A34A]">
                {answeredCount}/{TOTAL_QUESTIONS}
              </span>
              <div className="w-20 sm:w-28 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, #22C55E, #6D28D9)",
                  }}
                />
              </div>
              <span className="text-xs font-bold text-[#1F2937]">
                {progressPct}%
              </span>
            </div>
          </div>

          {/* Scale legend */}
          <div className="flex items-center gap-1 flex-wrap">
            {Object.entries(LIKERT_LABELS).map(([val, label]) => (
              <div
                key={val}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[10px] sm:text-xs"
              >
                <span className="font-bold text-[#16A34A]">{val}</span>
                <span className="text-[#6B7280]">= {label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Demographics section -- only show on first page */}
        {currentPage === 0 && (
          <section className="mb-8 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm p-5 sm:p-6">
            <h2 className="text-base font-bold font-heading text-[#1F2937] mb-4">
              Datos Demograficos
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Sexo */}
              <fieldset>
                <legend className="text-sm font-medium text-[#1F2937] mb-2.5">
                  Sexo
                  {showErrors && !sexo && (
                    <span className="ml-2 text-xs text-[#EF4444] font-normal inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Requerido
                    </span>
                  )}
                </legend>
                <div className="flex gap-3">
                  {(["masculino", "femenino"] as const).map((opt) => {
                    const isSelected = sexo === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSexo(opt)}
                        className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer capitalize ${
                          isSelected
                            ? "border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]"
                            : "border-[#E2E8F0] bg-[#FFFFFF] text-[#6B7280] hover:border-[#16A34A]/40"
                        }`}
                        aria-pressed={isSelected}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Facultad */}
              <div>
                <label className="text-sm font-medium text-[#1F2937] block mb-2">
                  Facultad
                </label>

                <Select
                  options={facultadOptions}
                  value={
                    facultadOptions.find((f) => f.value === facultad) || null
                  }
                  onChange={(selected) => {
                    setFacultad(selected?.value || "");
                    setPrograma(""); // 🔥 reset programa
                  }}
                  placeholder="Seleccione una facultad"
                  styles={customStyles}
                  isSearchable={false}
                />
                {showErrors && !facultad && (
                  <p className="text-xs text-[#EF4444] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Requerido
                  </p>
                )}
              </div>
              {/*Programa*/}
              <div>
                <label className="text-sm font-medium text-[#1F2937] block mb-2">
                  Programa
                </label>

                <Select
                  options={programaOptions}
                  value={
                    programaOptions.find((p) => p.value === programa) || null
                  }
                  onChange={(selected) => setPrograma(selected?.value || "")}
                  placeholder="Seleccione un programa"
                  isDisabled={!facultad}
                  styles={customStyles}
                  isSearchable={false}
                />
                {showErrors && !programa && (
                  <p className="text-xs text-[#EF4444] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Requerido
                  </p>
                )}
              </div>
              {/*Tipo de usuario*/}
              <fieldset>
                <legend className="text-sm font-medium text-[#1F2937] mb-2">
                  Tipo de usuario
                </legend>
                {showErrors && !tipoUsuario && (
                  <span className="ml-2 text-xs text-[#EF4444]">Requerido</span>
                )}
                <div className="flex gap-3">
                  {["Estudiante", "Docente", "Administrativo"].map((tipo) => {
                    const isSelected = tipoUsuario === tipo;
                    return (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setTipoUsuario(tipo)}
                        className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? "border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]"
                            : "border-[#E2E8F0] text-[#6B7280]"
                        }`}
                      >
                        {tipo}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          </section>
        )}

        {/* Page indicator */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-[#6B7280]">
            Pagina {currentPage + 1} de {TOTAL_PAGES}
          </span>
          <span className="text-xs text-[#6B7280]">
            Preguntas {pageStart + 1}--{pageEnd}
          </span>
        </div>

        {/* Page navigation dots */}
        <div className="flex items-center gap-1.5 mb-6">
          {Array.from({ length: TOTAL_PAGES }, (_, i) => {
            // Check if all questions on this page are answered
            const pStart = i * QUESTIONS_PER_PAGE;
            const pEnd = Math.min(pStart + QUESTIONS_PER_PAGE, TOTAL_QUESTIONS);
            const allAnsweredOnThisPage = Array.from(
              { length: pEnd - pStart },
              (__, j) => pStart + j + 1,
            ).every((q) => answers[q] !== undefined);

            const isCurrent = i === currentPage;
            return (
              <button
                key={i}
                onClick={() => {
                  setShowErrors(false);
                  setCurrentPage(i);
                  scrollToTop();
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? "w-8 bg-[#16A34A]"
                    : allAnsweredOnThisPage
                      ? "w-2 bg-[#22C55E]/50"
                      : "w-2 bg-[#E2E8F0]"
                }`}
                aria-label={`Ir a pagina ${i + 1}`}
              />
            );
          })}
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-4">
          {pageQuestions.map((qIndex) => {
            const questionText = QUESTIONS[qIndex - 1];
            const selectedValue = answers[qIndex];
            const hasError = showErrors && selectedValue === undefined;

            return (
              <div
                key={qIndex}
                className={`rounded-xl bg-[#FFFFFF] border shadow-sm p-4 sm:p-5 transition-colors ${
                  hasError
                    ? "border-[#EF4444]/50 bg-[#FEF2F2]"
                    : selectedValue !== undefined
                      ? "border-[#22C55E]/30"
                      : "border-[#E2E8F0]"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#F1F5F9] text-xs font-bold text-[#6B7280] shrink-0 mt-0.5">
                    {qIndex}
                  </span>
                  <p className="text-sm font-medium text-[#1F2937] leading-relaxed flex-1">
                    {questionText}
                  </p>
                  {selectedValue !== undefined && (
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#22C55E] shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Likert options -- horizontal on desktop, wrapping on mobile */}
                <div className="flex flex-wrap gap-2 ml-10">
                  {([1, 2, 3, 4] as const).map((val) => {
                    const isSelected = selectedValue === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleAnswer(qIndex, val)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]"
                            : "border-[#E2E8F0] bg-[#FFFFFF] text-[#6B7280] hover:border-[#16A34A]/30 hover:bg-[#F8FAFC]"
                        }`}
                        aria-pressed={isSelected}
                      >
                        <span
                          className={`flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold ${
                            isSelected
                              ? "bg-[#16A34A] text-[#FFFFFF]"
                              : "bg-[#F1F5F9] text-[#6B7280]"
                          }`}
                        >
                          {val}
                        </span>
                        <span className="hidden sm:inline">
                          {LIKERT_LABELS[val]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {hasError && (
                  <p className="flex items-center gap-1 ml-10 mt-2 text-xs text-[#EF4444]">
                    <AlertCircle className="w-3 h-3" />
                    Por favor responde esta pregunta
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Validation summary on last page */}
        {isLastPage && showErrors && !canSubmit && (
          <div className="mt-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-[#EF4444] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#EF4444]">
                  Formulario incompleto
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  {!allDemographicsFilled &&
                    "Faltan datos demográficos (sexo, facultad, programa o tipo de usuario)."}
                  {!allQuestionsFilled &&
                    `Faltan ${TOTAL_QUESTIONS - answeredCount} pregunta(s) por responder.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pb-8">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="px-5 py-2.5 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Anterior
          </button>

          <div className="flex items-center gap-3">
            {/* Back to top */}
            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-lg border border-[#E2E8F0] text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              aria-label="Volver arriba"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {isLastPage ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #16A34A, #22C55E)",
                }}
              >
                <Send className="w-4 h-4" />
                {submitting ? "Enviando..." : "Enviar Encuesta"}
              </button>
            ) : (
              <button
                onClick={handleNextPage}
                className="px-6 py-2.5 rounded-lg text-[#FFFFFF] text-sm font-semibold transition-all shadow-md shadow-[#16A34A]/20 hover:shadow-lg hover:shadow-[#16A34A]/25 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #16A34A, #22C55E)",
                }}
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
