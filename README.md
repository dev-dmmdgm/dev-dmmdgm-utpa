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

## HTTP Server
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
Creates a new user, then return its code.
```ts
type Input = {
    name: string;
    pass: string;
};
type Output = string;
```

### POST `/rename`
Changes a user's name, then returns its code.
```ts
type Input = {
    name: string;
    pass: string;
    rename: string;
};
type Output = string;
```

### POST `/repass`
Changes a user's pass, then regenerates and returns its code.
```ts
type Input = {
    name: string;
    pass: string;
    repass: string;
};
type Output = string;
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
Fetches a user's UUID from name.
```ts
type Input = {
    name: string;
};
type Output = string;
```

### PUT `/lookup`
Fetches a user's name from UUID.
```ts
type Input = {
    uuid: string;
};
type Output = string;
```

### POST `/generate`
Generates a user's token and return its code.
```ts
type Input = {
    name: string;
    pass: string;
};
type Output = string;
```

### PUT `/retrieve`
Returns a user's code.
```ts
type Input = {
    name: string;
    pass: string;
};
type Output = string;
```

### PUT `/identify`
Identifies a user's name from code.
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
Returns a token's privilege pval from privilege pkey.
```ts
type Input = {
    code: string;
    pkey: string;
};
type Output = string | null;
```

### POST `/list`
Returns all token's privilege pkey and pval pairs.
```ts
type Input = {
    code: string;
};
type Output = { [ pkey in string ]: string; };
```

## CLI
Register the CLI by running:
```sh
# Links package
bun link

# Runs CLI
utpa [command]
```

Run `utpa help` for more context.

---

###### Last Updated: 2025-10-24 @ 03:30.
