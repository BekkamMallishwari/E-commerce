// auth protection
const user =
    AppUtils.requireAuth();
if (
    user
) {
    loadUserProfile(
        user
    );
}

// elements
const elements = {
    sidebarName:
        document.getElementById(
            "sidebar-name"
        ),

    sidebarEmail:
        document.getElementById(
            "sidebar-email"
        ),

    profileName:
        document.getElementById(
            "profile-name"
        ),

    profileEmail:
        document.getElementById(
            "profile-email"
        ),

    profilePhone:
        document.getElementById(
            "profile-phone"
        ),

    profileAddress:
        document.getElementById(
            "profile-address"
        ),

    profileBio:
        document.getElementById(
            "profile-bio"
        ),

    profilePreview:
        document.getElementById(
            "profile-preview"
        ),

    profileForm:
        document.getElementById(
            "profile-form"
        ),

    avatarInput:
        document.getElementById(
            "avatar-input"
        )
};

// safe storage getter
const getStorageValue = (
    key
) => {
    return (
        localStorage.getItem(
            key
        ) || ""
    );
};

// load profile
function loadUserProfile(
    user
) {
    if (
        elements.sidebarName
    ) {
        elements.sidebarName.innerText =
            user.name || "User";
    }

    if (
        elements.sidebarEmail
    ) {
        elements.sidebarEmail.innerText =
            (
                user.email || ""
            ).trim();
    }

    if (
        elements.profileName
    ) {
        elements.profileName.value =
            getStorageValue(
                "profileName"
            )
            ||
            user.name
            ||
            "";
    }

    if (
        elements.profileEmail
    ) {
        elements.profileEmail.value =
            user.email || "";
    }

    if (
        elements.profilePhone
    ) {
        elements.profilePhone.value =
            getStorageValue(
                "profilePhone"
            );
    }

    if (
        elements.profileAddress
    ) {
        elements.profileAddress.value =
            getStorageValue(
                "profileAddress"
            );
    }

    if (
        elements.profileBio
    ) {
        elements.profileBio.value =
            getStorageValue(
                "profileBio"
            );
    }

    const savedAvatar =
        getStorageValue(
            "profileAvatar"
        );
    if (
        savedAvatar
        &&
        elements.profilePreview
    ) {
        elements.profilePreview.src =
            savedAvatar;
    }
}

// save profile
if (
    elements.profileForm
) {
    elements.profileForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();
            const name =
                elements.profileName.value.trim();
            if (
                !name
            ) {
                AppUtils.notify(
                    "Name cannot be empty",
                    "error"
                );
                return;
            }

            AppUtils.setJSON(
                "profileData",
                {
                    name,
                    phone:
                        elements.profilePhone.value.trim(),
                    address:
                        elements.profileAddress.value.trim(),
                    bio:
                        elements.profileBio.value.trim()
                }
            );

            // update sidebar
            if (
                elements.sidebarName
            ) {
                elements.sidebarName.innerText =
                    name;
            }

            // update stored user
            const updatedUser = {
                ...user,
                name
            };
            AppUtils.setJSON(
                "user",
                updatedUser
            );
            AppUtils.notify(
                "Profile updated successfully!",
                "success"
            );
        }
    );
}

// avatar upload
if (
    elements.avatarInput
) {
    elements.avatarInput.addEventListener(
        "change",
        (event) => {
            const file =
                event.target.files?.[0];

            if (
                !file
            ) {
                return;
            }

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];
            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {
                AppUtils.notify(
                    "Please upload a valid image",
                    "error"
                );
                return;
            }
            const maxSize =
                2 * 1024 * 1024;

            if (
                file.size > maxSize
            ) {
                AppUtils.notify(
                    "Image must be under 2MB",
                    "error"
                );
                return;
            }

            const reader =
                new FileReader();
            reader.onload =
                (loadEvent) => {
                    const image =
                        loadEvent.target.result;
                    if (
                        elements.profilePreview
                    ) {
                        elements.profilePreview.src =
                            image;
                    }
                    localStorage.setItem(
                        "profileAvatar",
                        image
                    );
                    AppUtils.notify(
                        "Avatar updated successfully!",
                        "success"
                    );
                };
            reader.readAsDataURL(
                file
            );
        }
    );
}