import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/component/ui/alert-dialog";

const ActionConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel = "Please wait...",
  onConfirm,
  pending = false,
  variant = "destructive",
}) => {
  const isDestructive = variant === "destructive";

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent className="z-[70] w-[calc(100%-2rem)] max-w-md gap-0 border-0 p-6 shadow-2xl">
        <AlertDialogHeader className="place-items-center text-center sm:place-items-center sm:text-center">
          <AlertDialogMedia
            className={`mb-4 size-14 rounded-full ${
              isDestructive ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
            }`}
          >
            <AlertTriangle aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-xl font-bold text-gray-800">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm text-gray-500">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mx-0 mb-0 mt-6 grid grid-cols-2 gap-3 border-0 bg-transparent p-0 sm:flex">
          <AlertDialogCancel
            disabled={pending}
            className="flex-1 rounded-lg border-gray-300 py-3 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              if (!pending) onConfirm();
            }}
            className={`flex-1 rounded-lg py-3 text-white ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {pending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ActionConfirmationDialog;
