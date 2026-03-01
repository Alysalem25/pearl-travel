"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import { Language } from "@/data/translations";
import { getDirection, getLanguageFromSearchParams } from "@/lib/language";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Mail, Check, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

type VisaStepOneForm = {
  name: string;
  phone: string;
  email: string;
  destination: string;
  otherCountries: string;
};

type VisaStep = 1 | 2 | 3;

type VisaStepTwoForm = {
  hasTraveledAbroad: "yes" | "no";
  visitedCountries: string;
};

type StepOneErrors = {
  name?: string;
  phone?: string;
  email?: string;
  destination?: string;
};

type StepTwoErrors = {
  visitedCountries?: string;
};

const INITIAL_STEP_ONE_FORM: VisaStepOneForm = {
  name: "",
  phone: "",
  destination: "",
  otherCountries: "",
};

const INITIAL_STEP_TWO_FORM: VisaStepTwoForm = {
  hasTraveledAbroad: "no",
  visitedCountries: "",
};

const countLetters = (value: string) => (value.match(/\p{L}/gu) ?? []).length;


interface Country {
  _id: string
  nameEn: string
  nameAr: string
  country: string
  images: string[]
  inhomepage: boolean
}


export default function VisaPage() {
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<VisaStep>(1);
  const [popupOpen, setPopupOpen] = useState(false);
  const [stepOneForm, setStepOneForm] = useState<VisaStepOneForm>(INITIAL_STEP_ONE_FORM);
  const [stepTwoForm, setStepTwoForm] = useState<VisaStepTwoForm>(INITIAL_STEP_TWO_FORM);
  const [stepOneErrors, setStepOneErrors] = useState<StepOneErrors>({});
  const [stepTwoErrors, setStepTwoErrors] = useState<StepTwoErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)

  useEffect(() => {
    setMounted(true);
    setLang(getLanguageFromSearchParams(searchParams));
    const handleLanguageChange = (e: CustomEvent<{ lang: Language }>) => setLang(e.detail.lang);
    window.addEventListener("languagechange", handleLanguageChange as EventListener);
    return () => window.removeEventListener("languagechange", handleLanguageChange as EventListener);
  }, [searchParams]);

  //  fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true)

        const res = await api.countries.getInVisa()

        // لو الـ API بترجع { countries: [...] }
        const data = res.data.countries || res.data

        if (Array.isArray(data)) {
          setCountries(data)
        } else {
          setCountries([])
        }

      } catch (err) {
        console.error("Error fetching countries", err)
        setCountries([])
      } finally {
        setLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [])


  if (!mounted) return null;

  const direction = getDirection(lang);
  const resetWizardState = () => {
    setCurrentStep(1);
    setStepOneForm(INITIAL_STEP_ONE_FORM);
    setStepTwoForm(INITIAL_STEP_TWO_FORM);
    setStepOneErrors({});
    setStepTwoErrors({});
  };

  const openPopup = () => {
    resetWizardState();
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    resetWizardState();
  };


  const handleStepOneNext = () => {
    const errors: StepOneErrors = {};
    const normalizedName = stepOneForm.name.trim();
    const normalizedPhone = stepOneForm.phone.trim();

    if (!normalizedName) {
      errors.name = "Name is required.";
    } else if (countLetters(normalizedName) < 3) {
      errors.name = "Name must be at least 3 letters.";
    }

    if (!normalizedPhone) {
      errors.phone = "Phone is required.";
    } else if (normalizedPhone.length < 11) {
      errors.phone = "Phone must be at least 11 digits.";
    }

    if (!stepOneForm.destination) {
      errors.destination = "Please select one destination.";
    }

    setStepOneErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setCurrentStep(2);
  };

  const handleStepTwoNext = () => {
    const errors: StepTwoErrors = {};

    if (
      stepTwoForm.hasTraveledAbroad === "yes" &&
      !stepTwoForm.visitedCountries.trim()
    ) {
      errors.visitedCountries = "Please enter countries you have visited.";
    }

    setStepTwoErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    // Submit the form
    handleFormSubmit();
  };

  const handleFormSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        fullName: stepOneForm.name,
        email: stepOneForm.email,
        phone: stepOneForm.phone,
        destination: stepOneForm.destination,
        otherCountries: stepOneForm.otherCountries,
        hasTraveledAbroad: stepTwoForm.hasTraveledAbroad === "yes",
        visitedCountries: stepTwoForm.visitedCountries
      };
      // const response = await api.visa.apply(payload);
      console.log("Submitting visa application with payload:", payload);
      const response = await axios.post("http://localhost:5000/visa", payload);

      if (response.data.applicationId) {
        setApplicationId(response.data.applicationId);
        setSubmitSuccess(true);
        setCurrentStep(3);
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitError(
        error.response?.data?.error ||
        error.message ||
        "An error occurred while submitting your application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToPreviousStep = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-white" dir={direction}>
        <Navbar />

        {/* Same layout as Egypt page: section + max-w-7xl + title + grid */}
        <div className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Where your journey begins
            </h2>

            {/* Same grid and card size as Egypt categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 py-4">
              {countries.map((country, index) => (
                <motion.div
                  key={country._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full"
                >
                  <div
                    className="bg-gradient-to-br rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-12 text-white h-64 flex flex-col items-center justify-center relative overflow-hidden"
                    style={{
                      backgroundImage: `url('http://localhost:5000${country.images[0]}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40" />
                    <h3 className="text-2xl font-bold relative z-10">{country.nameEn}</h3>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="flex justify-center mt-12"
            >
              <button
                type="button"
                onClick={openPopup}
                className="px-10 py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-blue-500 to-sky-500 border-2 border-blue-600/80 shadow-xl shadow-blue-200/50 hover:from-blue-600 hover:to-sky-600 hover:shadow-blue-300/60 transition-all duration-300"
              >
                Start your visa Application
              </button>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Popup modal - visa step 1 preview */}
      <AnimatePresence>
        {popupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePopup}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94%] max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200 z-50"
            >
              <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-t-2xl">
                <div className="w-9">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleGoToPreviousStep}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                      aria-label="Go to previous step"
                    >
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
                <p className="text-xl sm:text-2xl font-semibold text-center flex-1">
                  {currentStep === 1
                    ? "Visa Registration"
                    : currentStep === 2
                      ? "Travel History"
                      : "Thank You!"}
                </p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <p className="text-sm sm:text-lg font-medium">
                    {currentStep === 1
                      ? "Step 1 of 3"
                      : currentStep === 2
                        ? "Step 2 of 3"
                        : "Step 3 of 3"}
                  </p>
                  <button
                    type="button"
                    onClick={closePopup}
                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Close visa registration popup"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {currentStep === 1 ? (
                <div className="px-4 py-4 sm:px-6 sm:py-5 space-y-4">
                  <div className="grid gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-[90px_1fr] sm:items-center gap-1.5 sm:gap-3">
                      <label className="text-base sm:text-lg text-gray-700">Name:</label>
                      <div>
                        <input
                          type="text"
                          value={stepOneForm.name}
                          onChange={(e) => {
                            setStepOneForm((prev) => ({ ...prev, name: e.target.value }));
                            setStepOneErrors((prev) => ({ ...prev, name: undefined }));
                          }}
                          className={`w-full h-10 px-3 rounded-sm border text-gray-900 placeholder:text-gray-400 bg-white caret-gray-900 focus:outline-none focus:ring-2 ${stepOneErrors.name
                            ? "border-red-400 focus:ring-red-300 focus:border-red-400"
                            : "border-gray-300 focus:ring-blue-400 focus:border-blue-400"
                            }`}
                        />
                        {stepOneErrors.name && (
                          <p className="mt-1 text-sm text-red-600">{stepOneErrors.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[90px_1fr] sm:items-center gap-1.5 sm:gap-3">
                      <label className="text-base sm:text-lg text-gray-700">Phone:</label>
                      <div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={stepOneForm.phone}
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/\D/g, "");
                            setStepOneForm((prev) => ({ ...prev, phone: digitsOnly }));
                            setStepOneErrors((prev) => ({ ...prev, phone: undefined }));
                          }}
                          className={`w-full h-10 px-3 rounded-sm border text-gray-900 placeholder:text-gray-400 bg-white caret-gray-900 focus:outline-none focus:ring-2 ${stepOneErrors.phone
                            ? "border-red-400 focus:ring-red-300 focus:border-red-400"
                            : "border-gray-300 focus:ring-blue-400 focus:border-blue-400"
                            }`}
                        />
                        {stepOneErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{stepOneErrors.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[90px_1fr] sm:items-center gap-1.5 sm:gap-3">
                      <label className="text-base sm:text-lg text-gray-700">Email:</label>
                      <div>
                        <input
                          type="email"
                          value={stepOneForm.email}
                          onChange={(e) => {
                            setStepOneForm((prev) => ({ ...prev, email: e.target.value }));
                            setStepOneErrors((prev) => ({ ...prev, email: undefined }));
                          }}
                          className={`w-full h-10 px-3 rounded-sm border text-gray-900 placeholder:text-gray-400 bg-white caret-gray-900 focus:outline-none focus:ring-2 ${stepOneErrors.email
                            ? "border-red-400 focus:ring-red-300 focus:border-red-400"
                            : "border-gray-300 focus:ring-blue-400 focus:border-blue-400"
                            }`}
                        />
                        {stepOneErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{stepOneErrors.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-blue-800 mb-3">
                      Destination:
                    </h3>
                    <div className="max-h-52 overflow-y-auto pr-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
                        {countries.map((country) => (
                          <label
                            key={country._id}
                            className="inline-flex items-start gap-2 text-sm sm:text-base text-gray-800 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="destination"
                              value={country.nameEn}
                              checked={stepOneForm.destination === country.nameEn}
                              onChange={(e) =>
                                setStepOneForm((prev) => ({
                                  ...prev,
                                  destination: e.target.value,
                                  otherCountry: ""
                                }))
                              }
                              className="mt-0.5 h-4 w-4 accent-blue-600"
                            />
                            <span>{country.nameEn}</span>
                          </label>
                        ))}
                      </div>

                    </div>
                    {stepOneErrors.destination && (
                      <p className="mt-2 text-sm text-red-600">{stepOneErrors.destination}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[145px_1fr] sm:items-center gap-1.5 sm:gap-3">
                    <label className="text-base sm:text-lg text-gray-700">Other countries:</label>
                    <input
                      type="text"
                      value={stepOneForm.otherCountries}
                      onChange={(e) =>
                        setStepOneForm((prev) => ({ ...prev, otherCountries: e.target.value }))
                      }
                      placeholder="Enter other destinations"
                      className="w-full h-10 px-3 rounded-sm border border-gray-300 text-gray-900 placeholder:text-gray-400 bg-white caret-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleStepOneNext}
                      className="px-8 py-2 rounded-md bg-gradient-to-r from-blue-700 to-blue-500 text-white text-base font-medium hover:from-blue-800 hover:to-blue-600 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : currentStep === 2 ? (
                <div className="px-4 py-5 sm:px-6 sm:py-6 space-y-5">
                  <div className="space-y-4">
                    <p className="text-2xl sm:text-[32px] text-gray-800">
                      Have you ever traveled abroad?
                    </p>
                    <div className="flex items-center gap-8 sm:gap-12">
                      <label className="inline-flex items-center gap-2.5 text-2xl text-gray-800 cursor-pointer">
                        <input
                          type="radio"
                          name="hasTraveledAbroad"
                          value="yes"
                          checked={stepTwoForm.hasTraveledAbroad === "yes"}
                          onChange={() => {
                            setStepTwoForm((prev) => ({ ...prev, hasTraveledAbroad: "yes" }));
                            setStepTwoErrors((prev) => ({ ...prev, visitedCountries: undefined }));
                          }}
                          className="h-5 w-5 accent-blue-600"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-2.5 text-2xl text-gray-800 cursor-pointer">
                        <input
                          type="radio"
                          name="hasTraveledAbroad"
                          value="no"
                          checked={stepTwoForm.hasTraveledAbroad === "no"}
                          onChange={() => {
                            setStepTwoForm((prev) => ({
                              ...prev,
                              hasTraveledAbroad: "no",
                              visitedCountries: "",
                            }));
                            setStepTwoErrors((prev) => ({ ...prev, visitedCountries: undefined }));
                          }}
                          className="h-5 w-5 accent-blue-600"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  {stepTwoForm.hasTraveledAbroad === "yes" && (
                    <div className="space-y-3">
                      <label className="inline-flex items-center gap-2 text-xl text-gray-800">
                        <input
                          type="checkbox"
                          checked
                          readOnly
                          className="h-5 w-5 accent-blue-600 pointer-events-none"
                        />
                        <span>Countries you have visited:</span>
                      </label>
                      <input
                        type="text"
                        value={stepTwoForm.visitedCountries}
                        onChange={(e) => {
                          setStepTwoForm((prev) => ({
                            ...prev,
                            visitedCountries: e.target.value,
                          }));
                          setStepTwoErrors((prev) => ({ ...prev, visitedCountries: undefined }));
                        }}
                        className={`w-full h-11 px-3 rounded-sm border text-gray-900 placeholder:text-gray-400 bg-white caret-gray-900 focus:outline-none focus:ring-2 ${stepTwoErrors.visitedCountries
                          ? "border-red-400 focus:ring-red-300 focus:border-red-400"
                          : "border-gray-300 focus:ring-blue-400 focus:border-blue-400"
                          }`}
                      />
                      {stepTwoErrors.visitedCountries && (
                        <p className="text-sm text-red-600">{stepTwoErrors.visitedCountries}</p>
                      )}
                    </div>
                  )}

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleGoToPreviousStep}
                      disabled={submitting}
                      className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 text-base font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleStepTwoNext}
                      disabled={submitting}
                      className="px-8 py-2 rounded-md bg-gradient-to-r from-blue-700 to-blue-500 text-white text-base font-medium hover:from-blue-800 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-8 sm:px-6 sm:py-10">
                  {submitSuccess ? (
                    <>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="h-px flex-1 bg-gray-200" />
                        <div className="relative">
                          <div className="h-14 w-20 sm:h-16 sm:w-24 rounded-md bg-blue-100 border border-blue-300 flex items-center justify-center shadow-sm">
                            <Mail className="h-8 w-8 text-blue-700" />
                          </div>
                          <div className="absolute -right-2 -bottom-2 h-9 w-9 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>

                      <div className="mt-8 text-center space-y-4">
                        <p className="text-3xl sm:text-4xl font-semibold text-blue-900">
                          Thank you for registering!
                        </p>
                        <p className="text-xl sm:text-2xl text-gray-700">
                          Our visa team will contact you shortly.
                        </p>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          <strong>Application ID:</strong> {applicationId}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="text-2xl font-semibold text-red-900">Error</p>
                        <p className="text-red-700">{submitError || "Failed to submit application"}</p>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 mt-8 pt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={closePopup}
                      className="px-8 py-2 rounded-md bg-gray-200 text-gray-800 text-base font-medium hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
                )}
              </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}



