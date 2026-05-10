import { Upload, X, FileText, AlertCircle } from "lucide-react";

interface RegistrationFormStep2Props {
  formData: {
    idType: string;
    idFrontFile: File | null;
    idBackFile: File | null;
    idFrontPreview: string;
    idBackPreview: string;
  };
  onChange: (field: string, value: File | string | null) => void;
  errors: Record<string, string>;
}

const ID_TYPES = [
  { value: "philsys_national_id", label: "PhilSys National ID" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "passport", label: "Passport" },
  { value: "voters_id", label: "Voter's ID" },
  { value: "postal_id", label: "Postal ID" },
  { value: "umid", label: "UMID" },
  { value: "senior_citizen_id", label: "Senior Citizen ID" },
  { value: "barangay_id", label: "Barangay ID" },
];

export function RegistrationFormStep2({
  formData,
  onChange,
  errors,
}: RegistrationFormStep2Props) {
  const handleFileChange = (field: "idFrontFile" | "idBackFile", file: File | null) => {
    onChange(field, file);

    // Create preview URL
    if (file) {
      const previewField = field === "idFrontFile" ? "idFrontPreview" : "idBackPreview";
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(previewField, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      const previewField = field === "idFrontFile" ? "idFrontPreview" : "idBackPreview";
      onChange(previewField, "");
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB";
    }
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      return "Only JPEG and PNG files are allowed";
    }
    return null;
  };

  const FileUpload = ({
    label,
    field,
    preview,
    required = false,
  }: {
    label: string;
    field: "idFrontFile" | "idBackFile";
    preview: string;
    required?: boolean;
  }) => (
    <div>
      <label className="text-sm text-slate-600 mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {!preview ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-slate-300 transition-colors">
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                const error = validateFile(file);
                if (error) {
                  // You could set an error state here
                  alert(error);
                  return;
                }
              }
              handleFileChange(field, file);
            }}
            className="hidden"
            id={field}
          />
          <label htmlFor={field} className="cursor-pointer">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 mb-1">Click to upload {label.toLowerCase()}</p>
            <p className="text-xs text-slate-400">JPEG or PNG, max 5MB</p>
          </label>
        </div>
      ) : (
        <div className="relative">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <img
              src={preview}
              alt={label}
              className="w-full h-32 object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => handleFileChange(field, null)}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="text-xs text-slate-500 mt-1 text-center">
            {field === "idFrontFile" ? formData.idFrontFile?.name : formData.idBackFile?.name}
          </p>
        </div>
      )}

      {errors[field] && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm text-slate-600 mb-2 block">
          Government-Issued ID Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.idType}
          onChange={(e) => onChange("idType", e.target.value)}
          className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all ${
            errors.idType ? "border-red-300" : "border-slate-200"
          }`}
        >
          <option value="">Select ID type</option>
          {ID_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.idType && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.idType}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUpload
          label="ID Front"
          field="idFrontFile"
          preview={formData.idFrontPreview}
          required
        />
        <FileUpload
          label="ID Back (Optional)"
          field="idBackFile"
          preview={formData.idBackPreview}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">ID Verification Required</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Your government-issued ID will be reviewed by administrators before account approval.
              This helps ensure only legitimate residents can access the complaint system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}