import api from "@/config/api";

/**
 * Upload a file to Cloudflare R2 using a two-step process:
 * 1. Get a pre-signed URL from our backend
 * 2. Upload the file directly to R2 using that URL
 * 
 * @param file - The file to upload
 * @param folder - Target folder in R2 (e.g. 'blog-images')
 * @param isAdmin - Whether to use the admin presign endpoint
 * @returns The public CDN URL of the uploaded file
 */
export const uploadToR2 = async (file: File, folder: string, isAdmin: boolean = false): Promise<string> => {
    // 1. Get pre-signed URL from backend
    const endpoint = isAdmin ? "/admin/r2/presign" : "/general/r2/presign";
    const authToken = localStorage.getItem("authToken");

    const presignRes = await api.post(endpoint, {
        fileName: file.name,
        contentType: file.type,
        folder: folder
    }, {
        headers: isAdmin ? { Authorization: `Bearer ${authToken}` } : {}
    });

    if (!presignRes.data.success) {
        throw new Error("Failed to get upload authorization");
    }

    const { uploadUrl, publicUrl } = presignRes.data.data;

    // 2. Upload directly to R2
    const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
            "Content-Type": file.type,
        },
    });

    if (!uploadRes.ok) {
        throw new Error("Failed to upload to R2 storage");
    }

    return publicUrl;
};
