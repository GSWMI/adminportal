import { EyeOff, Lock, User, UserRoundPlus } from "lucide-react";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import PermissionToggle from "./PermissionToggle";

export type AddUserPermissions = {
  canAddUsersAndSetPermissions: boolean;
  canAddAndManageTickets: boolean;
  canScanAndRedeemTickets: boolean;
  canExportReports: boolean;
};

export type AddUserFormValues = {
  fullName: string;
  username: string;
  password: string;
  permissions: AddUserPermissions;
};

type AddUserFormProps = {
  onSubmitSuccess: (values: AddUserFormValues) => void;
};

function AddUserForm({ onSubmitSuccess }: AddUserFormProps) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword] = useState(false);

  const [permissions, setPermissions] = useState<AddUserPermissions>({
    canAddUsersAndSetPermissions: false,
    canAddAndManageTickets: false,
    canScanAndRedeemTickets: false,
    canExportReports: false,
  });

  const isValid = useMemo(() => {
    return (
      fullName.trim() !== "" &&
      username.trim() !== "" &&
      password.trim() !== ""
    );
  }, [fullName, username, password]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid) return;

    onSubmitSuccess({
      fullName,
      username,
      password,
      permissions,
    });
  };

  const handlePermissionChange =
    (key: keyof AddUserPermissions) => (checked: boolean) => {
      setPermissions((prev) => ({
        ...prev,
        [key]: checked,
      }));
    };

  const inputBaseClassName =
    "flex h-[40px] w-full items-center rounded-[8px] border border-[#D1D5DB] bg-white px-3";

  const inputClassName =
    "flex-1 border-none bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]";

  const renderInput = (
    label: string,
    value: string,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
    placeholder: string,
    type: "text" | "password" = "text",
    icon: typeof User,
    rightIcon?: React.ReactNode
  ) => {
    const Icon = icon;

    return (
      <div>
        <label className="mb-2 block text-[14px] font-medium text-[#374151]">
          {label}
        </label>

        <div className={inputBaseClassName}>
          <Icon size={18} className="mr-2 text-[#9CA3AF]" />
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={inputClassName}
          />
          {rightIcon ? <div className="ml-2 text-[#9CA3AF]">{rightIcon}</div> : null}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-87.5">
      <h2 className="text-center text-[18px] font-semibold text-[#111111]">
        New user
      </h2>

      <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
        {renderInput(
          "Full name",
          fullName,
          (e) => setFullName(e.target.value),
          "Enter first and last name",
          "text",
          User
        )}

        {renderInput(
          "Username",
          username,
          (e) => setUsername(e.target.value),
          "Enter a username",
          "text",
          User
        )}

        {renderInput(
          "Password",
          password,
          (e) => setPassword(e.target.value),
          "Enter a password",
          showPassword ? "text" : "password",
          Lock,
          <EyeOff size={18} />
        )}

        <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-3">
          <h3 className="text-center text-[16px] font-semibold text-[#374151]">
            Set permissions
          </h3>

          <p className="mt-3 text-[16px] text-[#4B5563]">Allow new user to:</p>

          <div className="mt-3 space-y-3">
            <PermissionToggle
              label="Add users & set permissions"
              checked={permissions.canAddUsersAndSetPermissions}
              onChange={handlePermissionChange("canAddUsersAndSetPermissions")}
            />

            <PermissionToggle
              label="Add & manage tickets"
              checked={permissions.canAddAndManageTickets}
              onChange={handlePermissionChange("canAddAndManageTickets")}
            />

            <PermissionToggle
              label="Scan & redeem tickets"
              checked={permissions.canScanAndRedeemTickets}
              onChange={handlePermissionChange("canScanAndRedeemTickets")}
            />

            <PermissionToggle
              label="Export reports"
              checked={permissions.canExportReports}
              onChange={handlePermissionChange("canExportReports")}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] text-[16px] font-semibold transition ${
            isValid
              ? "bg-[#2F55D4] text-white"
              : "cursor-not-allowed border border-[#E5E7EB] bg-[#F3F4F6] text-[#B0B7C3]"
          }`}
        >
          {isValid ? <UserRoundPlus size={18} /> : null}
          Add user
        </button>
      </form>
    </div>
  );
}

export default AddUserForm;