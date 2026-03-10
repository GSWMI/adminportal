import { useEffect, useState } from "react";
import ModalShell from "../common/ModalShell";
import AddUserForm, { type AddUserFormValues } from "./AddUserForm";
import AddUserSuccess from "./AddUserSuccess";

type AddUserModalProps = {
  open: boolean;
  onClose: () => void;
};

type AddUserStep = "form" | "success";

type CreatedUser = {
  username: string;
  password: string;
};

function AddUserModal({ open, onClose }: AddUserModalProps) {
  const [step, setStep] = useState<AddUserStep>("form");
  const [createdUser, setCreatedUser] = useState<CreatedUser>({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (!open) {
      setStep("form");
      setCreatedUser({
        username: "",
        password: "",
      });
    }
  }, [open]);

  if (!open) return null;

  const handleSubmitSuccess = (values: AddUserFormValues) => {
    setCreatedUser({
      username: values.username,
      password: values.password,
    });
    setStep("success");
  };

  const handleAddAnother = () => {
    setStep("form");
    setCreatedUser({
      username: "",
      password: "",
    });
  };

  const handleClose = () => {
    setStep("form");
    setCreatedUser({
      username: "",
      password: "",
    });
    onClose();
  };

  return (
    <ModalShell onClose={handleClose}>
      {step === "form" ? (
        <AddUserForm onSubmitSuccess={handleSubmitSuccess} />
      ) : (
        <AddUserSuccess
          username={createdUser.username}
          password={createdUser.password}
          onAddAnother={handleAddAnother}
          onBackToDashboard={handleClose}
        />
      )}
    </ModalShell>
  );
}

export default AddUserModal;