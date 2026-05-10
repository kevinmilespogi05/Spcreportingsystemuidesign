import { User, Mail, Lock, FileText, CheckCircle } from "lucide-react";

interface RegistrationFormStep4Props {
  formData: {
    fullName: string;
    email: string;
    password: string;
    idType: string;
    idFrontPreview: string;
    idBackPreview: string;
  };
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

const ID_TYPE_LABELS: Record<string, string> = {
  philsys_national_id: "PhilSys National ID",
  drivers_license: "Driver's License",
  passport: "Passport",
  voters_id: "Voter's ID",
  postal_id: "Postal ID",
  umid: "UMID",
  senior_citizen_id: "Senior Citizen ID",
  barangay_id: "Barangay ID",
};

export function RegistrationFormStep4({
  formData,
  termsAccepted,
  privacyAccepted,
}: RegistrationFormStep4Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">Review Your Information</h3>
        <p className="text-sm text-slate-600">
          Please review all information before submitting your registration.
        </p>
      </div>

      <div className="space-y-4">
        {/* Account Details */}
        <div className="border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-medium text-slate-800">Account Details</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Full Name:</span>
              <span className="text-slate-800 font-medium">{formData.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Email:</span>
              <span className="text-slate-800 font-medium">{formData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Password:</span>
              <span className="text-slate-800 font-medium">{"•".repeat(8)}</span>
            </div>
          </div>
        </div>

        {/* ID Verification */}
        <div className="border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-medium text-slate-800">Identity Verification</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">ID Type:</span>
              <span className="text-slate-800 font-medium">
                {ID_TYPE_LABELS[formData.idType] || formData.idType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {formData.idFrontPreview && (
                <div>
                  <p className="text-xs text-slate-600 mb-1">ID Front</p>
                  <img
                    src={formData.idFrontPreview}
                    alt="ID Front"
                    className="w-full h-20 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}
              {formData.idBackPreview && (
                <div>
                  <p className="text-xs text-slate-600 mb-1">ID Back</p>
                  <img
                    src={formData.idBackPreview}
                    alt="ID Back"
                    className="w-full h-20 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agreements */}
        <div className="border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-medium text-slate-800">Agreements</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                termsAccepted ? "bg-green-100" : "bg-slate-100"
              }`}>
                {termsAccepted && <CheckCircle className="w-3 h-3 text-green-600" />}
              </div>
              <span className="text-sm text-slate-700">Terms of Service</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                privacyAccepted ? "bg-green-100" : "bg-slate-100"
              }`}>
                {privacyAccepted && <CheckCircle className="w-3 h-3 text-green-600" />}
              </div>
              <span className="text-sm text-slate-700">Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">Ready to Submit</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Your registration will be submitted for administrator review. You will receive an email confirmation and notification once your account is approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}