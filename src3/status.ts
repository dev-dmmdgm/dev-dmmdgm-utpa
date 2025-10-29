// Defines codes
export enum Code {
    /* Action */
    ACTION_SUCCESSFUL,
    METHOD_NOT_FOUND,
    MALFORMED_BODY,
    MALFORMED_PARAMETERS,
    INTERNAL_ERROR,

    /* User */
    USER_ENTRY_MISSING = 100,
    USER_NAME_INVALID,
    USER_PASS_INVALID,
    USER_PASS_BLOCKED,
    USER_PASS_MISMATCH,
    USER_CREATE_FAILED,
    USER_VERIFY_FAILED,
    USER_RENAME_FAILED,
    USER_REPASS_FAILED,
    USER_DELETE_FAILED,
    USER_UNIQUE_FAILED,
    USER_LOOKUP_FAILED,
    USER_OBTAIN_FAILED,
    USER_REVEAL_FAILED,

    /* Token */
    TOKEN_ENTRY_MISSING = 200,
    TOKEN_CODE_BLOCKED,
    TOKEN_GENERATE_FAILED,
    TOKEN_RETRIEVE_FAILED,
    TOKEN_IDENTIFY_FAILED,

    /* Privilege */
    PRIVILEGE_ENTRY_MISSING = 300,
    PRIVILEGE_ALLOW_FAILED,
    PRIVILEGE_DENY_FAILED,
    PRIVILEGE_CHECK_FAILED,
    PRIVILEGE_LIST_FAILED
}

// Defines texts
export const texts: { [ code in Code ]: string; } = {
    /* Action */
    [ Code.ACTION_SUCCESSFUL ]: "Successfully processed action.",
    [ Code.METHOD_NOT_FOUND ]: "Attempted to execute an unknown method.",
    [ Code.MALFORMED_BODY ]: "JSON body is invalid, perhaps due to missing fields or incorrect data types.",
    [ Code.MALFORMED_PARAMETERS ]: "Parameters are invalid, perhaps due to missing fields or incorrect data types.",
    [ Code.INTERNAL_ERROR ]: "An internal error had occurred on the server.",

    /* User */
    [ Code.USER_ENTRY_MISSING ]: "User entry does not exist.",
    [ Code.USER_NAME_INVALID ]: "User name must be at least 6 characters (a-z, A-Z, 0-9, _) in length.",
    [ Code.USER_PASS_INVALID ]: "User pass must be at least 3 characters in length.",
    [ Code.USER_PASS_BLOCKED ]: "User pass does not match its hash.",
    [ Code.USER_PASS_MISMATCH ]: "Confirmation pass is different than the original pass.",
    [ Code.USER_CREATE_FAILED ]: "Failed to create user. User name is already in use.",
    [ Code.USER_VERIFY_FAILED ]: "Failed to verify user. Unable to complete verification.",
    [ Code.USER_RENAME_FAILED ]: "Failed to rename user. User entry does not exist or user name is already in use.",
    [ Code.USER_REPASS_FAILED ]: "Failed to repass user. User entry does not exist.",
    [ Code.USER_DELETE_FAILED ]: "Failed to delete user. User entry does not exist.",
    [ Code.USER_UNIQUE_FAILED ]: "Failed to fetch user UUID. User entry does not exist.",
    [ Code.USER_LOOKUP_FAILED ]: "Failed to fetch user name. User entry does not exist.",
    [ Code.USER_OBTAIN_FAILED ]: "Failed to fetch user UUIDs. Range is invalid.",
    [ Code.USER_REVEAL_FAILED ]: "Failed to fetch user names. Range is invalid.",

    /* Token */
    [ Code.TOKEN_ENTRY_MISSING ]: "Token entry does not exist.",
    [ Code.TOKEN_CODE_BLOCKED ]: "Token does not have the required privilege.",
    [ Code.TOKEN_GENERATE_FAILED ]: "Failed to generate token. Token code collided with another token entry.",
    [ Code.TOKEN_RETRIEVE_FAILED ]: "Failed to retrieve token. Token entry does not exist.",
    [ Code.TOKEN_IDENTIFY_FAILED ]: "Failed to identify token. Token entry does not exist.",

    /* Privilege */
    [ Code.PRIVILEGE_ENTRY_MISSING ]: "Privilege entry does not exist.",
    [ Code.PRIVILEGE_ALLOW_FAILED ]: "Failed to allow privilege. Privilege entry may be corrupted.",
    [ Code.PRIVILEGE_DENY_FAILED ]: "Failed to deny privilege. Privilege entry does not exist.",
    [ Code.PRIVILEGE_CHECK_FAILED ]: "Failed to check privilege. Privilege entry does not exist.",
    [ Code.PRIVILEGE_LIST_FAILED ]: "Failed to list privilege. Privilege entries do not exist."  
};

// Defines types
export const types: { [ code in Code ]: string; } = {
    /* Action */
    [ Code.ACTION_SUCCESSFUL ]: "ACTION_SUCCESSFUL",
    [ Code.METHOD_NOT_FOUND ]: "METHOD_NOT_FOUND",
    [ Code.MALFORMED_BODY ]: "MALFORMED_BODY",
    [ Code.MALFORMED_PARAMETERS ]: "MALFORMED_PARAMETERS",
    [ Code.INTERNAL_ERROR ]: "INTERNAL_ERROR",

    /* User */
    [ Code.USER_ENTRY_MISSING ]: "USER_ENTRY_MISSING",
    [ Code.USER_NAME_INVALID ]: "USER_NAME_INVALID",
    [ Code.USER_PASS_INVALID ]: "USER_PASS_INVALID",
    [ Code.USER_PASS_BLOCKED ]: "USER_PASS_BLOCKED",
    [ Code.USER_PASS_MISMATCH ]: "USER_PASS_MISMATCH",
    [ Code.USER_CREATE_FAILED ]: "USER_CREATE_FAILED",
    [ Code.USER_VERIFY_FAILED ]: "USER_VERIFY_FAILED",
    [ Code.USER_RENAME_FAILED ]: "USER_RENAME_FAILED",
    [ Code.USER_REPASS_FAILED ]: "USER_REPASS_FAILED",
    [ Code.USER_DELETE_FAILED ]: "USER_DELETE_FAILED",
    [ Code.USER_UNIQUE_FAILED ]: "USER_UNIQUE_FAILED",
    [ Code.USER_LOOKUP_FAILED ]: "USER_LOOKUP_FAILED",
    [ Code.USER_OBTAIN_FAILED ]: "USER_OBTAIN_FAILED",
    [ Code.USER_REVEAL_FAILED ]: "USER_REVEAL_FAILED",

    /* Token */
    [ Code.TOKEN_ENTRY_MISSING ]: "TOKEN_ENTRY_MISSING",
    [ Code.TOKEN_CODE_BLOCKED ]: "TOKEN_CODE_BLOCKED",
    [ Code.TOKEN_GENERATE_FAILED ]: "TOKEN_GENERATE_FAILED",
    [ Code.TOKEN_RETRIEVE_FAILED ]: "TOKEN_RETRIEVE_FAILED",
    [ Code.TOKEN_IDENTIFY_FAILED ]: "TOKEN_IDENTIFY_FAILED",

    /* Privilege */
    [ Code.PRIVILEGE_ENTRY_MISSING ]: "PRIVILEGE_ENTRY_MISSING",
    [ Code.PRIVILEGE_ALLOW_FAILED ]: "PRIVILEGE_ALLOW_FAILED",
    [ Code.PRIVILEGE_DENY_FAILED ]: "PRIVILEGE_DENY_FAILED",
    [ Code.PRIVILEGE_CHECK_FAILED ]: "PRIVILEGE_CHECK_FAILED",
    [ Code.PRIVILEGE_LIST_FAILED ]: "PRIVILEGE_LIST_FAILED"
};
