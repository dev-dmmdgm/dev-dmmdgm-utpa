# User-Token-Privilege Authenticaton (utpa.dmmdgm.dev)

## Synopsis
A simple service to provide API permissions for my wholistic websites.

## Prerequisites
- [Bun](https://bun.com/)

## Initialization
```sh
# Clones repository
git clone https://github.com/dev-dmmdgm/dev-dmmdgm-utpa

## Navigates to directory
cd dev-dmmdgm-utpa

## Installs dependencies
bun i
```

## Backend Server
Start a local server by running:
```sh
# Starts server
bun src/app
```

Change port by specifying `PORT` in your `.env` or by running:
```sh
# Starts server
PORT=3000 bun src/app
```

---

### POST `/create`
Creates a new user.
```ts
type Input = {
    name: string;
    pass: string;
};
type Output = null;
```

### POST `/rename`
Changes a user's name.
```ts
type Input = {
    name: string;
    pass: string;
    rename: string;
};
type Output = null;
```

### POST `/repass`
Changes a user's pass. This action will invalidate the user's previous token.
```ts
type Input = {
    name: string;
    pass: string;
    repass: string;
};
type Output = null;
```

### DELETE `/delete`
Deletes a user forever.
```ts
type Input = {
    name: string;
    pass: string;
};
type Output = null;
```

### PUT `/unique`
Fetches a user's UUID and returns result.
```ts
type Input = {
    name: string;
};
type Output = string;
```

### PUT `/lookup`
Fetches a user's name and returns result.
```ts
type Input = {
    uuid: string;
};
type Output = string;
```

### PUT `/obtain`
Fetches all user's UUIDs and returns results.
```ts
type Input = {
    size: number;
    page: number;
};
type Output = string[];
```

### PUT `/reveal`
Fetches all user's names and returns results.
```ts
type Input = {
    size: number;
    page: number;
};
type Output = string[];
```

### POST `/generate`
Generates a user's token.
```ts
type Input = {
    name: string;
    pass: string;
};
type Output = null;
```

### PUT `/retrieve`
Retrieves a user's token and returns result.
```ts
type Input = {
    name: string;
    pass: string;
};
type Output = string;
```

### PUT `/identify`
Identifies a user's name from a token code and results result.
```ts
type Input = {
    code: string;
};
type Output = string;
```

### POST `/allow`
Allows or updates a token's privilege.
```ts
type Input = {
    auth: string;
    code: string;
    pkey: string;
    pval: string;
};
type Output = null;
```

### POST `/deny`
Deletes a token's privilege forever.
```ts
type Input = {
    auth: string;
    code: string;
    pkey: string;
};
type Output = null;
```

### PUT `/check`
Fetches a privilege's pval and returns result.
```ts
type Input = {
    code: string;
    pkey: string;
};
type Output = string | null;
```

### PUT `/list`
Fetches all privilege pairs and returns results.
```ts
type Input = {
    code: string;
};
type Output = { [ pkey in string ]: string; };
```

## CLI
Use the CLI by running:
```sh
# Runs CLI
bun src/cli <command> [...parameters]
```

Run `bun src/cli help` for more context.

Link the binary by running:
```sh
# Links package
bun link

# Runs CLI
utpa <command> [...parameters]
```

Run `utpa help` for more context.

---

###### Last Updated: 2025-10-30 @ 03:15.
