import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ProfileResponse = {
  success: boolean;
  message: string;
  data?: {
    user?: {
      id: number;
      name: string;
      email: string;
      phone: string;
      avatar: string | null;
    };
  };
};

export default function Profile() {
  type User = NonNullable<NonNullable<ProfileResponse["data"]>["user"]>;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: async () => {
      const raw =
        localStorage.getItem("auth_user") ||
        sessionStorage.getItem("auth_user");

      if (raw) {
        try {
          const user = JSON.parse(raw) as User;

          return { success: true, message: "OK", data: { user } };
        } catch { /* empty */ }
      }

      const response = await api.get<ProfileResponse>("/api/auth/me");
      return response.data;
    },
  });

  const errorMessage = (() => {
    if (!isError) return "";
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: string } | undefined;
      if (data?.message) return data.message;
    }
    return "Gagal memuat profil.";
  })();

  const shouldLogin = (() => {
    if (!isError) return false;
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const data = error.response?.data as { message?: string } | undefined;
      return statusCode === 401 || data?.message === "Access token required";
    }
    return false;
  })();

  const user = data?.data?.user;
  const previewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile],
  );

  useEffect(() => {
    if (!open || !user) return;
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setAvatarFile(null);
    setFormError(null);
  }, [open, user]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validate = () => {
    if (!name.trim()) return "Name is required.";
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Invalid email format.";
    if (!phone.trim()) return "Mobile phone number is required.";
    if (!/^\d{8,15}$/.test(phone.replace(/\D/g, "")))
      return "Mobile phone number must be 8-15 digits.";
    return null;
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const errorText = validate();
      if (errorText) throw new Error(errorText);
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      if (avatarFile) formData.append("avatar", avatarFile);
      const response = await api.put<{
        success: boolean;
        message: string;
        data: User;
      }>("/api/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (res) => {
      const updatedUser = res.data;
      const storage =
        localStorage.getItem("auth_token") !== null
          ? localStorage
          : sessionStorage;
      storage.setItem("auth_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));
      queryClient.setQueryData<ProfileResponse>(["profile"], {
        success: true,
        message: res.message,
        data: { user: updatedUser },
      });
      toast(res.message || "Profile updated successfully");
      setOpen(false);
    },
    onError: (err: unknown) => {
      if (err instanceof Error) setFormError(err.message);
      else setFormError("Failed to update profile.");
    },
  });

  return (
    <div className="flex flex-col gap-4 md:gap-6 pt-4 md:pt-0 md:w-131 mb-12 md:mb-48">
      <h1 className=" font-extrabold text-2xl leading-9 md:text-[32px] md:leading-10.5 ">
        Profile
      </h1>
      {isLoading && (
        <div className="flex flex-col gap-6 p-4 bg-white shadow-2xl rounded-3xl md:p-5">
          <div className="flex flex-col gap-2 md:gap-3">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-11 w-full rounded-[100px]" />
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load profile</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
          {shouldLogin && (
            <div className="pt-3">
              <Button
                onClick={() => window.location.assign("/auth")}
                className="h-9 rounded-[100px] bg-primary-100 text-white font-bold text-[14px] leading-7 -tracking-[0.02em]"
              >
                Login to view profile
              </Button>
            </div>
          )}
        </Alert>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col gap-6 p-4 bg-white shadow-2xl rounded-3xl md:p-5  ">
          <div className="flex flex-col gap-2 md:gap-3">
            <div
              className="h-16 w-16 rounded-full inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${
                  user?.avatar || "/images/common/profile-dummy.svg"
                }')`,
              }}
            ></div>
            <div className="flex flex-row justify-between">
              <span className="font-medium text-sm leading-7 md:text-base md:leading-7.5 -tracking-[0.03em]">
                Name
              </span>
              <span className="font-bold text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[0.02em]">
                {user?.name || "-"}
              </span>
            </div>
            <div className="flex flex-row justify-between">
              <span className="font-medium text-sm leading-7 md:text-base md:leading-7.5 -tracking-[0.03em] ">
                Email
              </span>
              <span className="font-bold text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[0.02em]">
                {user?.email || "-"}
              </span>
            </div>
            <div className="flex flex-row justify-between">
              <span className="font-medium text-sm leading-7 md:text-base md:leading-7.5 -tracking-[0.03em] ">
                Mobile phone number
              </span>
              <span className="font-bold text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[0.02em]">
                {user?.phone || "-"}
              </span>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() => setOpen(true)}
            className="
    h-11 md:h-12 w-full rounded-[100px]
    bg-primary-100 text-white
    font-bold text-[14px] leading-7 -tracking-[0.02em]
    items-center justify-center text-center
    md:text-[16px] md:leading-7.5 md:-tracking-[0.02em]
    cursor-pointer
  "
          >
            Update Profile
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('${
                    previewUrl ||
                    user?.avatar ||
                    "/images/common/profile-dummy.svg"
                  }')`,
                }}
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Avatar</label>
                <Input
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Mobile phone number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            {formError && (
              <div className="text-sm font-semibold text-red-600">
                {formError}
              </div>
            )}
            <Button
              variant={"destructive"}
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="h-11 rounded-[100px] bg-primary-100 text-white font-bold cursor-pointer text-[14px] leading-7 -tracking-[0.02em] md:text-[16px] md:leading-7.5 md:-tracking-[0.02em]"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
