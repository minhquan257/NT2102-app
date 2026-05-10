import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type HttpMethod = "GET" | "POST";

type RequestSpec = {
  method: HttpMethod;
  path: string;
  body?: Record<string, string>;
  query?: Record<string, string>;
};

type RiskItem = {
  issueCode: string;
  title: string;
  owasp2024: string;
  description: string;
  insecureSpecs: RequestSpec[];
  secureSpecs: RequestSpec[];
  navigateTo?: string;
};

type FieldDef = {
  key: string;
  label: string;
  secure?: boolean;
};

type CaseMode = "insecure" | "secure";

type CodeTokenKind =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "function"
  | "operator";

type CodeToken = {
  text: string;
  kind: CodeTokenKind;
};

const CODE_KEYWORDS = new Set([
  "async",
  "await",
  "const",
  "let",
  "var",
  "return",
  "if",
  "else",
  "throw",
  "new",
  "class",
  "import",
  "from",
  "export",
  "try",
  "catch",
  "for",
  "while",
  "switch",
  "case",
  "break",
  "continue",
  "null",
  "true",
  "false",
  "typeof",
]);

const CODE_TOKEN_REGEX =
  /(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b[A-Za-z_]\w*\b|\b\d+(?:\.\d+)?\b|[{}()[\].,;:+\-*/=<>!&|?]+)/g;

function findCommentStart(line: string): number {
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;

  for (let i = 0; i < line.length - 1; i += 1) {
    const ch = line[i];
    const next = line[i + 1];
    const prev = i > 0 ? line[i - 1] : "";

    if (ch === "'" && !inDouble && !inTemplate && prev !== "\\") {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle && !inTemplate && prev !== "\\") {
      inDouble = !inDouble;
      continue;
    }
    if (ch === "`" && !inSingle && !inDouble && prev !== "\\") {
      inTemplate = !inTemplate;
      continue;
    }

    if (!inSingle && !inDouble && !inTemplate && ch === "/" && next === "/") {
      return i;
    }
  }

  return -1;
}

function tokenizeCodeChunk(chunk: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  const matches = chunk.matchAll(CODE_TOKEN_REGEX);
  let lastIndex = 0;

  for (const match of matches) {
    const text = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      tokens.push({
        text: chunk.slice(lastIndex, index),
        kind: "plain",
      });
    }

    let kind: CodeTokenKind = "plain";
    if (text.startsWith("\"") || text.startsWith("'") || text.startsWith("`")) {
      kind = "string";
    } else if (/^\d/.test(text)) {
      kind = "number";
    } else if (/^[A-Za-z_]\w*$/.test(text)) {
      if (CODE_KEYWORDS.has(text)) {
        kind = "keyword";
      } else {
        const remaining = chunk.slice(index + text.length);
        kind = /^\s*\(/.test(remaining) ? "function" : "plain";
      }
    } else {
      kind = "operator";
    }

    tokens.push({ text, kind });
    lastIndex = index + text.length;
  }

  if (lastIndex < chunk.length) {
    tokens.push({
      text: chunk.slice(lastIndex),
      kind: "plain",
    });
  }

  return tokens;
}

function tokenizeCodeLine(line: string): CodeToken[] {
  const commentStart = findCommentStart(line);
  if (commentStart === -1) {
    return tokenizeCodeChunk(line);
  }

  const beforeComment = line.slice(0, commentStart);
  const comment = line.slice(commentStart);
  return [
    ...tokenizeCodeChunk(beforeComment),
    { text: comment, kind: "comment" },
  ];
}

const UPDATE_ROWS = [
  { from2016: "M4 + M6", to2024: "M3 Insecure Authentication / Authorization", note: "Merged" },
  { from2016: "M3", to2024: "M5 Insecure Communication", note: "Moved" },
  { from2016: "M2", to2024: "M9 Insecure Data Storage", note: "Moved" },
  { from2016: "M5", to2024: "M10 Insufficient Cryptography", note: "Moved" },
  { from2016: "M8 + M9", to2024: "M7 Insufficient Binary Protections", note: "Merged" },
  { from2016: "M10", to2024: "M8 Security Misconfiguration", note: "Reworded" },
  { from2016: "New", to2024: "M1 Improper Credential Usage", note: "New" },
  { from2016: "New", to2024: "M2 Inadequate Supply Chain Security", note: "New" },
  { from2016: "New", to2024: "M4 Input/Output Validation", note: "New" },
  { from2016: "New", to2024: "M6 Inadequate Privacy Controls", note: "New" },
];

const RISKS: RiskItem[] = [
  {
    issueCode: "IMPROPER_CREDENTIAL_USAGE",
    title: "Improper credential usage",
    owasp2024: "M1",
    description:
      "Hardcoded, reused, or long-lived credentials can be extracted and abused. Demo shows hardcoded API keys vs. short-lived tokens.",
    insecureSpecs: [
      {
        method: "GET",
        path: "/m1/insecure-api-key",
      },
      {
        method: "GET",
        path: "/m1/insecure-stored-credentials",
      },
    ],
    secureSpecs: [
      {
        method: "GET",
        path: "/m1/safe-api-key",
      },
      {
        method: "GET",
        path: "/m1/safe-stored-credentials",
      },
    ],
  },
  {
    issueCode: "SUPPLY_CHAIN_SECURITY_WEAK",
    title: "Old library / dependency risk",
    owasp2024: "M2",
    description:
      "Outdated libraries can introduce known vulnerabilities; the secure flow audits and scans dependencies before release.",
    insecureSpecs: [
      {
        method: "GET",
        path: "/m2/insecure-dependencies",
      },
      {
        method: "GET",
        path: "/m2/insecure-build-info",
      },
    ],
    secureSpecs: [
      {
        method: "GET",
        path: "/m2/safe-dependencies",
      },
      {
        method: "GET",
        path: "/m2/safe-build-info",
      },
    ],
  },
  {
    issueCode: "PASSCODE_RATE_LIMIT_OFF",
    title: "Disable passcode rate limit",
    owasp2024: "M3",
    description:
      "Brute-force is possible when repeated failed attempts are not throttled or locked. Credentials appear in URL (server logs / proxy history).",
    insecureSpecs: [
      {
        method: "GET",
        path: "/m5/login",
        query: { username: "{{username}}", password: "{{password}}" },
      },
    ],
    secureSpecs: [
      {
        method: "POST",
        path: "/m5/safe-login",
        body: { username: "{{username}}", password: "{{password}}" },
      },
    ],
  },
  // {
  //   issueCode: "UNVALIDATED_EXTERNAL_INPUT",
  //   title: "Unvalidated external input (SQLi via INSERT)",
  //   owasp2024: "M4",
  //   description:
  //     "Raw string interpolation in SQL INSERT lets an attacker break out of string literals and inject arbitrary SQL.",
  //   insecureSpecs: [
  //     {
  //       method: "POST",
  //       path: "/sqli/create",
  //       body: {
  //         customerName: "{{customerName}}",
  //         contactName: "Bob",
  //         address: "123 Main St",
  //         city: "New York",
  //         postalCode: "10001",
  //         country: "US",
  //         password: "{{password}}",
  //         username: "{{username}}",
  //       },
  //     },
  //   ],
  //   secureSpecs: [
  //     {
  //       method: "POST",
  //       path: "/sqli/safe/create",
  //       body: {
  //         customerName: "Safe User",
  //         contactName: "Safe Contact",
  //         address: "1 Main Street",
  //         city: "HCM",
  //         postalCode: "700000",
  //         country: "VN",
  //         password: "{{password}}",
  //         username: "{{username}}",
  //         phoneNumber: "0901234567",
  //       },
  //     },
  //   ],
  // },
  {
    issueCode: "SQLI_UNION_BASED",
    title: "Union-based SQL injection (data exfiltration)",
    owasp2024: "M4",
    description:
      "Raw id injected into SELECT … WHERE customer_id = <id>. A UNION payload appends an attacker-controlled row, leaking usernames and passwords from the database.",
    insecureSpecs: [
      {
        method: "GET",
        path: "/sqli/union",
        query: { id: "{{unionPayload}}" },
      },
    ],
    secureSpecs: [
      {
        method: "GET",
        path: "/sqli/safe/union",
        query: { id: "{{safeId}}" },
      },
    ],
  },
  {
    issueCode: "NET_HTTP_NO_TLS",
    title: "Token in URL / no HSTS (Insecure Communication)",
    owasp2024: "M5",
    description:
      "Session token passed as URL query param leaks into server logs, CDN logs, browser history, and Referer headers. Response lacks HSTS.",
    insecureSpecs: [
      { method: "GET", path: "/m5/sensitive-data" },
      {
        method: "GET",
        path: "/m5/profile",
        query: { token: "{{token}}" },
      },
    ],
    secureSpecs: [
      {
        method: "POST",
        path: "/m5/safe-login",
        body: { username: "{{username}}", password: "{{password}}" },
      },
    ],
  },
  {
    issueCode: "PRIVACY_CONTROLS_WEAK",
    title: "Inadequate privacy controls",
    owasp2024: "M6",
    description:
      "Insufficient consent/data-minimization/access controls can expose personal data and violate privacy requirements.",
    insecureSpecs: [
      {
        method: "GET",
        path: "/m6/insecure-profile",
        query: { userId: "{{userId}}" },
      },
      {
        method: "GET",
        path: "/m6/insecure-data-sharing",
        query: { userId: "{{userId}}" },
      },
    ],
    secureSpecs: [
      {
        method: "GET",
        path: "/m6/safe-profile",
        query: { userId: "{{userId}}" },
      },
      {
        method: "GET",
        path: "/m6/safe-data-sharing",
      },
    ],
  },
  {
    issueCode: "BINARY_PROTECTIONS_WEAK",
    title: "Insufficient binary protections",
    owasp2024: "M7",
    description:
      "Missing hardening makes it easier to read runtime behavior; the demo shows a plain log call versus an obfuscated one.",
    insecureSpecs: [
      {
        method: "GET",
        path: "/m7/insecure-hardening",
      },
      {
        method: "GET",
        path: "/m7/insecure-runtime-info",
      },
    ],
    secureSpecs: [
      {
        method: "GET",
        path: "/m7/safe-hardening",
      },
      {
        method: "GET",
        path: "/m7/safe-runtime-info",
      },
    ],
  },
  {
    issueCode: "MISCONF_FLAG_SECURE_OFF",
    title: "FLAG_SECURE disabled",
    owasp2024: "M8",
    description:
      "Sensitive content can be captured via screenshots/recording when screen protection is off.",
    insecureSpecs: [],
    secureSpecs: [],
  },
  {
    issueCode: "INSECURE_DATA_STORAGE",
    title: "Insecure Data Storage",
    owasp2024: "M9",
    description:
      "Sensitive data at rest is exposed when stored without strong encryption, key protection, or lifecycle controls.",
    insecureSpecs: [
      {
        method: "GET",
        path: "/m9/insecure-storage-status",
      },
      {
        method: "GET",
        path: "/m9/insecure-cache-status",
      },
    ],
    secureSpecs: [
      {
        method: "GET",
        path: "/m9/safe-storage-status",
      },
      {
        method: "GET",
        path: "/m9/safe-cache-status",
      },
    ],
    navigateTo: "scene4.tsx",
  },
  {
    issueCode: "INSECURE_DATA_STORAGE_FILE_LEAK",
    title: "File leak storage exposure",
    owasp2024: "M9",
    description:
      "Exportable files in shared locations can expose sensitive tokens and secrets to other apps or users.",
    insecureSpecs: [],
    secureSpecs: [],
    navigateTo: "scene4.tsx",
  },
  {
    issueCode: "CRYPTO_MD5_NO_SALT",
    title: "Weak password hashing",
    owasp2024: "M10",
    description:
      "Fast hashes like MD5/SHA1 are easy to crack; the secure flow uses bcrypt with a random salt.",
    insecureSpecs: [
      {
        method: "POST",
        path: "/sqli/create",
        body: {
          customerName: "CryptoTest",
          contactName: "CryptoTest",
          address: "Addr",
          city: "City",
          postalCode: "12345",
          country: "VN",
          password: "{{password}}",
          username: "{{username}}_insecure",
        },
      },
    ],
    secureSpecs: [
      {
        method: "POST",
        path: "/sqli/safe/create",
        body: {
          customerName: "CryptoTest Safe",
          contactName: "CryptoTest Safe",
          address: "Addr",
          city: "City",
          postalCode: "12345",
          country: "VN",
          password: "{{password}}",
          username: "{{username}}_secure",
          phoneNumber: "0909090909",
        },
      },
    ],
  },
];

const RISK_FIELD_DEFS: Record<string, FieldDef[]> = {
  PASSCODE_RATE_LIMIT_OFF: [
    { key: "username", label: "Username" },
    { key: "password", label: "Password", secure: true },
  ],
  // UNVALIDATED_EXTERNAL_INPUT: [
  //   { key: "customerName", label: "Customer Name (try SQL injection)" },
  //   { key: "username", label: "Username" },
  //   { key: "password", label: "Password", secure: true },
  // ],
  NET_HTTP_NO_TLS: [
    { key: "username", label: "Username" },
    { key: "password", label: "Password", secure: true },
    { key: "token", label: "Token (sent in URL - leaks to logs)" },
  ],
  CRYPTO_MD5_NO_SALT: [
    { key: "username", label: "Username" },
    { key: "password", label: "Password (MD5/SHA1 vs bcrypt + salt)" },
  ],
  SQLI_UNION_BASED: [
    {
      key: "unionPayload",
      label: "id / UNION payload (injected into WHERE clause)",
    },
    {
      key: "safeId",
      label: "Safe UUID (for secure mode)",
    },
  ],
  IMPROPER_CREDENTIAL_USAGE: [],
  SUPPLY_CHAIN_SECURITY_WEAK: [],
  PRIVACY_CONTROLS_WEAK: [
    { key: "userId", label: "User ID" },
  ],
  BINARY_PROTECTIONS_WEAK: [],
  INSECURE_DATA_STORAGE: [],
};

const BACKEND_CODE_SNIPPETS: Record<string, { insecure: string; secure: string }> = {
  PASSCODE_RATE_LIMIT_OFF: {
    insecure: `// core-service/src/m5/m5.service.ts
async loginViaQueryParams(username: string, password: string) {
  const sql = \
\
    SELECT customer_id, username, password
    FROM customers
    WHERE username = '\${username}'
      AND password = '\${password}'
    LIMIT 1
  \
\
  ;
  const rows = await this.dataSource.query(sql);
  return rows[0];
}`,
    secure: `// core-service/src/m5/m5.service.ts
async safeLogin(username: string, password: string) {
  const user = await this.safeCustomerRepo.findOne({ where: { username } });
  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');
  return { access_token: this.jwtService.sign({ sub: user.customerId }) };
}

// core-service/src/m5/m5.controller.ts
res.setHeader('Strict-Transport-Security',
  'max-age=63072000; includeSubDomains; preload');`,
  },
  // UNVALIDATED_EXTERNAL_INPUT: {
  //   insecure: `// core-service/src/sqli/sqli.service.ts
  // async unsafeCreate(body: Record<string, any>) {
  //   const sql = \
  // \
  //     INSERT INTO customers (...)
  //     VALUES ('\${customerName}', '\${contactName}', ..., '\${username}')
  //     RETURNING customer_id, customer_name, username
  // \
  // \
  //   ;
  //   return this.dataSource.query(sql);
  // }`,
  //   secure: `// core-service/src/sqli/sqli.service.ts
  // async safeCreate(dto: CreateCustomerDto) {
  //   if (!dto.customerName || dto.customerName.length > 255) {
  //     throw new BadRequestException('customerName is required and must be <=255 characters');
  //   }
  //   const hashedPassword = await bcrypt.hash(dto.password, 10);
  //   const customer = this.safeCustomerRepo.create({ ...dto, passwordHash: hashedPassword });
  //   return this.safeCustomerRepo.save(customer);
  // }`,
  // },
  NET_HTTP_NO_TLS: {
    insecure: `// core-service/src/m5/m5.controller.ts
@Get('sensitive-data')
async getSensitiveData(@Res() res: Response) {
  // Deliberately no Strict-Transport-Security header
  res.setHeader('Content-Type', 'application/json');
  return res.json(await this.m5Service.getSensitiveData());
}

// core-service/src/m5/m5.controller.ts
@Get('profile')
async getProfileViaTokenInUrl(@Query('token') token: string) {
  return this.m5Service.getProfileViaTokenInUrl(token);
}`,
    secure: `// core-service/src/m5/m5.controller.ts
@Post('safe-login')
async safeLogin(...) {
  const result = await this.m5Service.safeLogin(username, password);
  res.setHeader('Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload');
  return res.json(result);
}`,
  },
  CRYPTO_MD5_NO_SALT: {
    insecure: `// app/m10PasswordHashing.tsx
import MD5 from 'crypto-js/md5';
import SHA1 from 'crypto-js/sha1';

const md5Hash = MD5(password).toString();
const sha1Hash = SHA1(password).toString();
const result = { md5Hash, sha1Hash };`,
    secure: `// app/m10PasswordHashing.tsx
import bcrypt from 'bcryptjs';

const saltRounds = 12;
const salt = await bcrypt.genSalt(saltRounds);
const passwordHash = await bcrypt.hash(password, salt);
const result = { saltRounds, salt, passwordHash };`,
  },
  SQLI_UNION_BASED: {
    insecure: `// core-service/src/sqli/sqli.service.ts
async unionBased(id: string): Promise<any[]> {
  const sql = \
\
    SELECT *
    FROM customers
    WHERE customer_id = \${id}
  \
\
  ;
  return this.dataSource.query(sql);
}`,
    secure: `// core-service/src/sqli/sqli.service.ts
async safeUnionBased(id: string) {
  if (!UUID_REGEX.test(id)) {
    throw new BadRequestException('id must be a valid UUID v4');
  }
  return this.safeCustomerRepo.findOne({ where: { customerId: id } });
}`,
  },
  MISCONF_FLAG_SECURE_OFF: {
    insecure: `// No backend endpoint for this risk.
// This is validated on-device in app/flag-secure.tsx (screen-capture protection off).`,
    secure: `// No backend endpoint for this risk.
// This is validated on-device in app/flag-secure.tsx (FLAG_SECURE enabled).`,
  },
  IMPROPER_CREDENTIAL_USAGE: {
    insecure: `// core-service/src/m1/m1.service.ts
async insecureGetApiKey() {
  return {
    warning: 'Hardcoded and long-lived',
    api_key: 'sk_live_51234567890_abcdef_HARDCODED',
    api_key_expires: 'NEVER',
    bearer_token: 'eyJhbGciOiJIUzI1NiIs...',
    risks: ['Key visible in logs', 'Never expires'],
  };
}`,
    secure: `// core-service/src/m1/m1.service.ts
async safeGetApiKey() {
  const expiresInSeconds = 3600;
  return {
    access_token: 'temp_token_' + Date.now() + '_with_expiry',
    token_type: 'Bearer',
    expires_in: expiresInSeconds,
    scopes: ['read:profile', 'write:data'],
    refresh_token_required: 'yes',
  };
}`,
  },
  SUPPLY_CHAIN_SECURITY_WEAK: {
    insecure: `// core-service/src/m2/m2.service.ts
async insecureCheckDependencies() {
  return {
    dependencies: [
      { name: 'lodash', version: '4.17.15', vulnerabilities: 1, severity: 'HIGH', cve: 'CVE-2019-10744' },
      { name: 'express', version: '4.16.2', vulnerabilities: 5, severity: 'HIGH' },
    ],
    risks: ['Known library vulnerabilities', 'No dependency audit', 'No SBOM or scanning gate'],
  };
}`,
    secure: `// core-service/src/m2/m2.service.ts
async safeCheckDependencies() {
  return {
    dependencies: [
      { name: 'lodash', version: '4.17.21', vulnerabilities: 0 },
      { name: 'express', version: '4.18.2', vulnerabilities: 0 },
    ],
    security_measures: [
      'npm audit run in CI before release',
      'Dependency tree scanned with npm ls / npm audit',
      'Alerts block builds when high severity issues are found',
    ],
  };
}`,
  },
  PRIVACY_CONTROLS_WEAK: {
    insecure: `// core-service/src/m6/m6.service.ts
async insecureGetUserProfile(userId: string) {
  return {
    user_id: userId,
    full_name: 'John Doe',
    email: 'john@example.com',
    ssn: '123-45-6789',
    credit_card: '4532-1111-2222-3333',
    location_history: [...],
    data_shared_with: ['marketing-agency', 'data-broker'],
    risks: ['All PII collected', 'No consent tracking'],
  };
}`,
    secure: `// core-service/src/m6/m6.service.ts
async safeGetUserProfile(userId: string) {
  return {
    user_id: userId,
    display_name: 'John D.',
    email_for_notifications: '[email redacted]',
    data_collection_consents: {
      basic_profile: { consent_given: true },
      marketing_emails: { consent_given: false },
      location_tracking: { consent_given: false },
    },
    third_party_sharing: 'None',
  };
}`,
  },
  BINARY_PROTECTIONS_WEAK: {
    insecure: `// app/m7Obfuscation.tsx
console.log('Hello World');`,
    secure: `// app/m7Obfuscation.tsx
const encodedMessage = 'SGVsbG8gV29ybGQ=';
const logMethod = console['lo' + 'g'];
const decodedMessage = atob(encodedMessage);
logMethod(decodedMessage);`,
  },
  INSECURE_DATA_STORAGE: {
    insecure: `// core-service/src/m9/m9.service.ts
async insecureGetStorageStatus() {
  return {
    device_storage: {
      shared_preferences: {
        encryption: 'NONE',
        contents: { auth_token: 'plaintext', api_key: 'plaintext' },
        accessibility: 'Readable by any app',
      },
      database: {
        encryption: 'NONE',
        tables: ['users (password_plaintext)', 'credentials'],
      },
    },
    risks: ['Plaintext on disk', 'No encryption'],
  };
}`,
    secure: `// core-service/src/m9/m9.service.ts
async safeGetStorageStatus() {
  return {
    device_storage: {
      keychain: {
        encryption: 'AES-256-GCM',
        master_key: 'Android Keystore (hardware-backed)',
        biometric_protection: true,
      },
      database: {
        encryption: 'SQLCipher (AES-256)',
        password_derived_from: 'Keystore master key',
      },
    },
    features: ['All data encrypted', 'Hardware-backed encryption'],
  };
}`,
  },
};

function resolveSpec(spec: RequestSpec, values: Record<string, string>): RequestSpec {
  const replaceVars = (obj?: Record<string, string>) =>
    obj
      ? Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [
            k,
            v.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? ""),
          ]),
        )
      : obj;

  return {
    ...spec,
    body: replaceVars(spec.body),
    query: replaceVars(spec.query),
  };
}

function buildUrl(baseApiUrl: string, path: string, query?: Record<string, string>) {
  const base = baseApiUrl.replace(/#.*$/, "").replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });
  }

  return url.toString();
}

function stringifyResult(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

async function callSpec(baseApiUrl: string, spec: RequestSpec) {
  const url = buildUrl(baseApiUrl, spec.path, spec.query);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);

  let response: Response;
  try {
    response = await fetch(url, {
      method: spec.method,
      headers: { "Content-Type": "application/json" },
      body: spec.method === "POST" ? JSON.stringify(spec.body || {}) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = await response.text();
  }

  return {
    ok: response.ok,
    status: response.status,
    url,
    payload,
  };
}

export default function OwaspMobileRiskLabScreen() {
  const router = useRouter();

  const initialApiUrl =
    (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
    process.env.EXPO_PUBLIC_API_URL ||
    "https://core-service-znxz.onrender.com";

  const [apiUrl, setApiUrl] = useState(initialApiUrl);
  const [results, setResults] = useState<Record<string, string>>({});
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [showBackendCode, setShowBackendCode] = useState<Record<string, boolean>>({});
  const [codeModeByRisk, setCodeModeByRisk] = useState<Record<string, CaseMode>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, string>>>({});
  const [isLoadingFields, setIsLoadingFields] = useState(true);

  const activeApiUrl = useMemo(
    () => apiUrl.trim() || process.env.EXPO_PUBLIC_API_URL || "https://core-service-znxz.onrender.com",
    [apiUrl],
  );

  // Fetch initial field values from backend
  useEffect(() => {
    const fetchInitialValues = async () => {
      try {
        const response = await fetch(`${activeApiUrl}/samples/initial-values`);
        if (response.ok) {
          const data = await response.json();
          setFieldValues(data);
        } else {
          // Fallback to hardcoded values if fetch fails
          const ts = Date.now().toString().slice(-6);
          setFieldValues({
            PASSCODE_RATE_LIMIT_OFF: {
              username: "admin",
              password: "takasecurity",
            },
            // UNVALIDATED_EXTERNAL_INPUT: {
            //   customerName: `test_${ts}`,
            //   username: `sqli_${ts}`,
            //   password: "testpass",
            // },
            NET_HTTP_NO_TLS: {
              username: "admin",
              password: "takasecurity",
              token: "token_alice_plaintext_abc123",
            },
            CRYPTO_MD5_NO_SALT: {
              username: `cryptotest_${ts}`,
              password: "plaintextpass",
            },
            SQLI_UNION_BASED: {
              unionPayload:
                "0 UNION SELECT 1,username,password,NULL,NULL,NULL,NULL,NULL,NULL FROM customers--",
              safeId: "123e4567-e89b-4d3c-a456-426614174000",
            },
          });
        }
      } catch (error) {
        // Fallback to hardcoded values if fetch fails
        const ts = Date.now().toString().slice(-6);
        setFieldValues({
          PASSCODE_RATE_LIMIT_OFF: { username: "admin", password: "takasecurity" },
          UNVALIDATED_EXTERNAL_INPUT: {
            customerName: `test_${ts}`,
            username: `sqli_${ts}`,
            password: "testpass",
          },
          NET_HTTP_NO_TLS: {
            username: "admin",
            password: "takasecurity",
            token: "token_alice_plaintext_abc123",
          },
          CRYPTO_MD5_NO_SALT: {
            username: `cryptotest_${ts}`,
            password: "plaintextpass",
          },
          SQLI_UNION_BASED: {
            unionPayload:
              "0 UNION SELECT 1,username,password,NULL,NULL,NULL,NULL,NULL,NULL FROM customers--",
            safeId: "123e4567-e89b-4d3c-a456-426614174000",
          },
        });
      } finally {
        setIsLoadingFields(false);
      }
    };

    fetchInitialValues();
  }, [activeApiUrl]);

  const runScenario = async (risk: RiskItem, mode: "insecure" | "secure") => {
    if (risk.issueCode === "IMPROPER_CREDENTIAL_USAGE") {
      router.push({ pathname: "/m1Credential", params: { mode } });
      return;
    }
    if (risk.issueCode === "SUPPLY_CHAIN_SECURITY_WEAK") {
      router.push({ pathname: "/m2Dependency", params: { mode } });
      return;
    }
    if (risk.issueCode === "BINARY_PROTECTIONS_WEAK") {
      router.push({ pathname: "/m7Obfuscation", params: { mode } });
      return;
    }
    if (risk.issueCode === "CRYPTO_MD5_NO_SALT") {
      router.push({ pathname: "/m10PasswordHashing", params: { mode } });
      return;
    }
    if (risk.issueCode === "PASSCODE_RATE_LIMIT_OFF") {
      router.push("/scene1");
      return;
    }
    if (risk.issueCode === "MISCONF_FLAG_SECURE_OFF") {
      router.push("/flag-secure");
      return;
    }
    if (risk.issueCode === "INSECURE_DATA_STORAGE") {
      router.push("/scene2");
      return;
    }
    if (risk.issueCode === "PRIVACY_CONTROLS_WEAK") {
      router.push("/scene3");
      return;
    }
    if (
      // risk.issueCode === "UNVALIDATED_EXTERNAL_INPUT" ||
      risk.issueCode === "SQLI_UNION_BASED" ||
      risk.issueCode === "INSECURE_DATA_STORAGE" ||
      risk.issueCode === "INSECURE_DATA_STORAGE_FILE_LEAK"
    ) {
      router.push("/scene4");
      return;
    }
    if (risk.issueCode === "NET_HTTP_NO_TLS") {
      router.push("/insecureCommunication");
      return;
    }

    const specs = mode === "insecure" ? risk.insecureSpecs : risk.secureSpecs;
    if (!specs.length) {
      setResults((prev) => ({
        ...prev,
        [risk.issueCode]: "No API scenario configured for this item.",
      }));
      return;
    }

    setRunningKey(`${risk.issueCode}:${mode}`);
    setResults((prev) => ({
      ...prev,
      [risk.issueCode]: "Connecting... (server may be waking up, please wait up to 60s)",
    }));

    let lastError = "No endpoint matched.";
    const userValues = fieldValues[risk.issueCode] ?? {};
    const runValues = { ...userValues };

    if (
      // (risk.issueCode === "UNVALIDATED_EXTERNAL_INPUT" ||
        risk.issueCode === "CRYPTO_MD5_NO_SALT" &&
      runValues.username
    ) {
      runValues.username = `${runValues.username}_${Date.now().toString().slice(-5)}`;
    }

    for (const spec of specs) {
      try {
        const response = await callSpec(activeApiUrl, resolveSpec(spec, runValues));
        const resultText = [
          `[${mode.toUpperCase()}] ${risk.issueCode}`,
          `Endpoint: ${response.url}`,
          `Status: ${response.status}`,
          "Response:",
          stringifyResult(response.payload),
        ].join("\n");

        setResults((prev) => ({
          ...prev,
          [risk.issueCode]: resultText,
        }));

        if (response.ok) {
          setRunningKey(null);
          return;
        }

        lastError = `HTTP ${response.status} from ${response.url}`;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        lastError = `${spec.path}: ${message}`;
      }
    }

    setResults((prev) => ({
      ...prev,
      [risk.issueCode]: `Unable to run ${mode} scenario. ${lastError}`,
    }));
    setRunningKey(null);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>OWASP Mobile 2024 Risk Lab</Text>
        <Text style={styles.heroSubtitle}>
          Based on Security_Issue_Matrix.xlsx + 2016 to 2024 final release updates.
        </Text>

        <Text style={styles.inputLabel}>Core-service API URL</Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={
            process.env.EXPO_PUBLIC_API_URL || "https://core-service-znxz.onrender.com"
          }
          placeholderTextColor="#789"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>2016 to 2024 Mapping</Text>
        {UPDATE_ROWS.map((row, index) => (
          <View key={`${row.to2024}-${index}`} style={styles.mappingRow}>
            <Text style={styles.mappingFrom}>{row.from2016}</Text>
            <Text style={styles.mappingArrow}>{"->"}</Text>
            <Text style={styles.mappingTo}>{row.to2024}</Text>
            <Text style={styles.mappingNote}>{row.note}</Text>
          </View>
        ))}
      </View>

      {RISKS.map((risk) => {
        const isInsecureLoading = runningKey === `${risk.issueCode}:insecure`;
        const isSecureLoading = runningKey === `${risk.issueCode}:secure`;
        const backendCode = BACKEND_CODE_SNIPPETS[risk.issueCode];
        const selectedMode = codeModeByRisk[risk.issueCode] ?? "insecure";
        const isCodeVisible = !!showBackendCode[risk.issueCode];
        const codeText = backendCode ? backendCode[selectedMode] : "";
        const codeLines = codeText.split("\n");
        const isRedirectOnlyCase = [
          "IMPROPER_CREDENTIAL_USAGE",
          "SUPPLY_CHAIN_SECURITY_WEAK",
          "BINARY_PROTECTIONS_WEAK",
          "CRYPTO_MD5_NO_SALT",
          "PASSCODE_RATE_LIMIT_OFF",
          "MISCONF_FLAG_SECURE_OFF",
          // "UNVALIDATED_EXTERNAL_INPUT",
          "SQLI_UNION_BASED",
          "NET_HTTP_NO_TLS",
          "PRIVACY_CONTROLS_WEAK",
          "INSECURE_DATA_STORAGE",
          "INSECURE_DATA_STORAGE_FILE_LEAK",
        ].includes(risk.issueCode);

        return (
          <View key={risk.issueCode} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.issueCode}>{risk.issueCode}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{risk.owasp2024}</Text>
              </View>
            </View>

            <Text style={styles.riskTitle}>{risk.title}</Text>
            <Text style={styles.riskDescription}>{risk.description}</Text>

            {!isRedirectOnlyCase && (RISK_FIELD_DEFS[risk.issueCode] ?? []).map((field) => (
              <View key={field.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={fieldValues[risk.issueCode]?.[field.key] ?? ""}
                  onChangeText={(val) =>
                    setFieldValues((prev) => ({
                      ...prev,
                      [risk.issueCode]: {
                        ...prev[risk.issueCode],
                        [field.key]: val,
                      },
                    }))
                  }
                  secureTextEntry={field.secure}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#567"
                />
              </View>
            ))}

           {!isRedirectOnlyCase && (
            <>
             <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.insecureBtn]}
                onPress={() => runScenario(risk, "insecure")}
                disabled={isInsecureLoading || isSecureLoading}
              >
                {isInsecureLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Run Insecure</Text>
                )}
              </Pressable>

              <Pressable
                style={[styles.button, styles.secureBtn]}
                onPress={() => runScenario(risk, "secure")}
                disabled={isInsecureLoading || isSecureLoading}
              >
                {isSecureLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Run Secure</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Result</Text>
              <Text style={styles.resultText}>
                {results[risk.issueCode] ||
                  "Tap Run Insecure / Run Secure to call your core-service endpoint."}
              </Text>
            </View>

            <Pressable
              style={styles.backendBtn}
              onPress={() =>
                setShowBackendCode((prev) => ({
                  ...prev,
                  [risk.issueCode]: !prev[risk.issueCode],
                }))
              }
            >
              <Text style={styles.buttonText}>
                {isCodeVisible ? "Hide BE Code" : "Show BE Code"}
              </Text>
            </Pressable>
            </>
            )}

            {isCodeVisible && backendCode && (
              <View style={styles.codePanel}>
                <View style={styles.toggleRow}>
                  <Pressable
                    style={[
                      styles.toggleBtn,
                      selectedMode === "insecure" && styles.toggleBtnActive,
                    ]}
                    onPress={() =>
                      setCodeModeByRisk((prev) => ({
                        ...prev,
                        [risk.issueCode]: "insecure",
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.toggleBtnText,
                        selectedMode === "insecure" && styles.toggleBtnTextActive,
                      ]}
                    >
                      Insecure Code
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.toggleBtn,
                      selectedMode === "secure" && styles.toggleBtnActive,
                    ]}
                    onPress={() =>
                      setCodeModeByRisk((prev) => ({
                        ...prev,
                        [risk.issueCode]: "secure",
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.toggleBtnText,
                        selectedMode === "secure" && styles.toggleBtnTextActive,
                      ]}
                    >
                      Secure Code
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.editorHeader}>
                  <View style={styles.editorDots}>
                    <View style={[styles.editorDot, styles.editorDotRed]} />
                    <View style={[styles.editorDot, styles.editorDotYellow]} />
                    <View style={[styles.editorDot, styles.editorDotGreen]} />
                  </View>
                  <Text style={styles.editorTitle}>
                    {risk.issueCode.toLowerCase()}.{selectedMode}.ts
                  </Text>
                </View>

                <ScrollView style={styles.codeScroll} nestedScrollEnabled>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.editorRow}>
                      <View style={styles.gutterCol}>
                        {codeLines.map((_, idx) => (
                          <Text key={`ln-${risk.issueCode}-${idx}`} style={styles.gutterText}>
                            {idx + 1}
                          </Text>
                        ))}
                      </View>

                      <View style={styles.codeCol}>
                        {codeLines.map((line, idx) => {
                          const lineTokens = tokenizeCodeLine(line || " ");
                          return (
                            <Text key={`code-${risk.issueCode}-${idx}`} style={styles.codeText}>
                              {lineTokens.map((token, tokenIdx) => (
                                <Text
                                  key={`token-${risk.issueCode}-${idx}-${tokenIdx}`}
                                  style={[
                                    styles.codeText,
                                    token.kind === "comment" && styles.codeComment,
                                    token.kind === "string" && styles.codeString,
                                    token.kind === "keyword" && styles.codeKeyword,
                                    token.kind === "number" && styles.codeNumber,
                                    token.kind === "function" && styles.codeFunction,
                                    token.kind === "operator" && styles.codeOperator,
                                  ]}
                                >
                                  {token.text}
                                </Text>
                              ))}
                            </Text>
                          );
                        })}
                      </View>
                    </View>
                  </ScrollView>
                </ScrollView>
              </View>
            )}

            {risk.issueCode === "PASSCODE_RATE_LIMIT_OFF" && (
              <>

                <Pressable
                  style={styles.demoBtn}
                  onPress={() => router.push("/scene1")}
                >
                  <Text style={styles.buttonText}>PASS CODE RATE LIMIT OFF (M3)</Text>
                </Pressable>
              </>
            )}

            {risk.issueCode === "IMPROPER_CREDENTIAL_USAGE" && (
              <>
                <Pressable
                  style={styles.demoBtn}
                  onPress={() => router.push("/m1Credential")}
                >
                  <Text style={styles.buttonText}>IMPROPER CREDENTIAL USAGE (M1)</Text>
                </Pressable>
              </>
            )}

            {risk.issueCode === "SUPPLY_CHAIN_SECURITY_WEAK" && (
              <>
                <Pressable
                  style={styles.demoBtn}
                  onPress={() => router.push("/m2Dependency")}
                >
                  <Text style={styles.buttonText}>INADEQUATE SUPPLY CHAIN SECURITY (M2)</Text>
                </Pressable>
              </>
            )}

            {risk.issueCode === "BINARY_PROTECTIONS_WEAK" && (
              <>
                <Pressable
                  style={styles.demoBtn}
                  onPress={() => router.push("/m7Obfuscation")}
                >
                  <Text style={styles.buttonText}>INSUFFICIENT BINARY PROTECTIONS (M7)</Text>
                </Pressable>
              </>
            )}

            {risk.issueCode === "CRYPTO_MD5_NO_SALT" && (
              <>
                <Pressable
                  style={styles.demoBtn}
                  onPress={() => router.push("/m10PasswordHashing")}
                >
                  <Text style={styles.buttonText}>WEAK PASSWORD HASHING (M10)</Text>
                </Pressable>
              </>
            )}

            {risk.issueCode === "MISCONF_FLAG_SECURE_OFF" && (
              <>

                <Pressable
                  style={styles.demoBtn}
                  onPress={() => router.push("/flag-secure")}
                >
                  <Text style={styles.buttonText}>Demo FLAG_SECURE (M8)</Text>
                </Pressable>
              </>
            )}

            {risk.issueCode === "INSECURE_DATA_STORAGE" && (
              <>
                <Pressable
                  style={styles.demoBtn}
                  onPress={() => router.push("/scene2")}
                >
                  <Text style={styles.buttonText}>INSECURE DATA STORAGE (M9)</Text>
                </Pressable>
              </>
            )}

            {risk.issueCode === "PRIVACY_CONTROLS_WEAK" && (
              <>

                <Pressable
                  style={styles.demoBtn}
                  onPress={() => router.push("/scene3")}
                >
                  <Text style={styles.buttonText}>PRIVACY CONTROLS WEAK (M6)</Text>
                </Pressable>
              </>
            )}

            {(risk.issueCode === "INSECURE_DATA_STORAGE_FILE_LEAK" ) && (
              <>

                <Pressable
                  style={styles.demoBtn}
                  onPress={() => router.push("/scene4")}
                >
                  <Text style={styles.buttonText}>INSECURE DATA STORAGE FILE LEAK (M9)</Text>
                </Pressable>
              </>
            )}
            {(
              risk.issueCode === "SQLI_UNION_BASED") && (
              <>

                <Pressable
                  style={styles.demoBtn}
                  onPress={() => router.push("/sqlInjection")}
                >
                  <Text style={styles.buttonText}>SQL INJECTION (M4)</Text>
                </Pressable>
              </>
            )}

            {risk.issueCode === "NET_HTTP_NO_TLS" && (
              <>

                <Pressable
                  style={styles.demoBtn}
                  onPress={() => router.push("/insecureCommunication")}
                >
                  <Text style={styles.buttonText}>NET HTTP NO TLS (M5)</Text>
                </Pressable>
              </>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0b1726",
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "#12263f",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#255789",
  },
  heroTitle: {
    color: "#d9f0ff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroSubtitle: {
    color: "#98bbd6",
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  inputLabel: {
    color: "#9ecdf5",
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 12,
  },
  input: {
    backgroundColor: "#091424",
    borderColor: "#2e5b87",
    borderWidth: 1,
    borderRadius: 12,
    color: "#ecf6ff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  card: {
    backgroundColor: "#101f32",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#263f5c",
  },
  cardTitle: {
    color: "#bde2ff",
    fontWeight: "800",
    fontSize: 17,
    marginBottom: 10,
  },
  mappingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  mappingFrom: {
    color: "#f6c177",
    fontWeight: "700",
    minWidth: 55,
  },
  mappingArrow: {
    color: "#96a9bd",
    fontWeight: "700",
  },
  mappingTo: {
    color: "#dce8f5",
    flexShrink: 1,
    maxWidth: "68%",
  },
  mappingNote: {
    color: "#61d78b",
    fontWeight: "700",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  issueCode: {
    color: "#8ec7ff",
    fontSize: 12,
    fontWeight: "800",
  },
  badge: {
    borderRadius: 999,
    backgroundColor: "#1a3553",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#4f7fb1",
  },
  badgeText: {
    color: "#d9f0ff",
    fontWeight: "700",
    fontSize: 12,
  },
  riskTitle: {
    color: "#e3f3ff",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 4,
  },
  riskDescription: {
    color: "#a8c0d6",
    lineHeight: 20,
    marginBottom: 10,
  },
  fieldRow: {
    marginBottom: 8,
  },
  fieldLabel: {
    color: "#7fb5e8",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: "#07111d",
    borderColor: "#2e4661",
    borderWidth: 1,
    borderRadius: 8,
    color: "#d6e6f5",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: "Courier",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    marginTop: 4,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  insecureBtn: {
    backgroundColor: "#b83d4b",
  },
  secureBtn: {
    backgroundColor: "#1f7a58",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },
  resultBox: {
    backgroundColor: "#07111d",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2e4661",
    padding: 10,
  },
  resultLabel: {
    color: "#7fb5e8",
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 12,
  },
  resultText: {
    color: "#d6e6f5",
    fontFamily: "Courier",
    fontSize: 12,
    lineHeight: 18,
  },
  hintText: {
    marginTop: 8,
    color: "#9ac7ea",
    fontSize: 12,
  },
  demoBtn: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#2a527a",
  },
  backendBtn: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#3e4f92",
  },
  codePanel: {
    marginTop: 10,
    backgroundColor: "#0b1322",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#324864",
    overflow: "hidden",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    margin: 10,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2f4d6a",
    backgroundColor: "#101b2c",
    paddingVertical: 8,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: "#225a86",
    borderColor: "#74b8ed",
  },
  toggleBtnText: {
    color: "#9cb7cf",
    fontSize: 12,
    fontWeight: "700",
  },
  toggleBtnTextActive: {
    color: "#e8f6ff",
  },
  codeScroll: {
    maxHeight: 260,
    borderTopWidth: 1,
    borderTopColor: "#2e425d",
  },
  editorHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111d31",
    borderTopWidth: 1,
    borderTopColor: "#2e425d",
    borderBottomWidth: 1,
    borderBottomColor: "#2e425d",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },
  editorDots: {
    flexDirection: "row",
    gap: 6,
  },
  editorDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  editorDotRed: {
    backgroundColor: "#ff5f56",
  },
  editorDotYellow: {
    backgroundColor: "#ffbd2e",
  },
  editorDotGreen: {
    backgroundColor: "#27c93f",
  },
  editorTitle: {
    color: "#9fb7d0",
    fontSize: 12,
    fontWeight: "700",
  },
  editorRow: {
    flexDirection: "row",
    alignItems: "stretch",
    minWidth: "100%",
  },
  gutterCol: {
    backgroundColor: "#101a2d",
    borderRightWidth: 1,
    borderRightColor: "#2e425d",
    paddingVertical: 10,
    paddingHorizontal: 8,
    minWidth: 42,
    alignItems: "flex-end",
  },
  gutterText: {
    color: "#5f7894",
    fontSize: 11,
    lineHeight: 18,
    fontFamily: "Courier",
  },
  codeCol: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#0a1426",
  },
  codeText: {
    color: "#cde5ff",
    fontFamily: "Courier",
    fontSize: 12,
    lineHeight: 18,
  },
  codeComment: {
    color: "#6aa56a",
  },
  codeString: {
    color: "#e5c07b",
  },
  codeKeyword: {
    color: "#5ea2ff",
  },
  codeNumber: {
    color: "#d19a66",
  },
  codeFunction: {
    color: "#56b6c2",
  },
  codeOperator: {
    color: "#b8c7da",
  },
});
