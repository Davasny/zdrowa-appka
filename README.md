# zdrowa appka

This app lets you automatically book classes in polish zdrofit gym application.

## Installation

1. Install dependencies

```bash
pnpm i
```

2. Create a `.env` file with the following content:

```env
export ZDROFIT_USERNAME=<your email>
export ZDROFIT_PASSWORD=<your password>
```

## Usage

```bash
# run all-in-one frontend
pnpm run start:frontend

# run cronjob to automatically book classes
pnpm run start:booker
```

## Testing

```bash
pnpm run test
```
