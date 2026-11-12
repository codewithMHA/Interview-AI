export interface DriverTestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

/**
 * Splits a raw test-case input string into parsed argument values.
 * Supports newline-separated JSON values and named LeetCode inputs like `nums = [2,7], target = 9`.
 */
export function parseRawInputArgs(raw: string): any[] {
  if (!raw || !raw.trim()) return [];
  const trimmed = raw.trim();

  const tokens: string[] = [];
  let current = '';
  let depthBracket = 0;
  let depthBrace = 0;
  let depthParen = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];

    if (inString) {
      current += ch;
      if (ch === stringChar && trimmed[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      current += ch;
      continue;
    }

    if (ch === '[') depthBracket++;
    else if (ch === ']') depthBracket = Math.max(0, depthBracket - 1);
    else if (ch === '{') depthBrace++;
    else if (ch === '}') depthBrace = Math.max(0, depthBrace - 1);
    else if (ch === '(') depthParen++;
    else if (ch === ')') depthParen = Math.max(0, depthParen - 1);

    if ((ch === ',' || ch === '\n') && depthBracket === 0 && depthBrace === 0 && depthParen === 0) {
      if (current.trim().length > 0) {
        tokens.push(current.trim());
      }
      current = '';
    } else {
      current += ch;
    }
  }

  if (current.trim().length > 0) {
    tokens.push(current.trim());
  }

  return tokens.map((token) => {
    const clean = token.replace(/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*/, '').trim();
    try {
      return JSON.parse(clean);
    } catch {
      if (/^-?\d+(\.\d+)?$/.test(clean)) return Number(clean);
      if (clean === 'true' || clean === 'True') return true;
      if (clean === 'false' || clean === 'False') return false;
      if (clean === 'null' || clean === 'None') return null;
      return clean;
    }
  });
}

function escapeQuoted(str: string): string {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Ensures standalone Java playground snippets compile in Judge0's Main.java container file.
 */
export function normalizeJavaPlaygroundSource(userCode: string): string {
  const withoutPkg = userCode.replace(/^\s*package\s+[^;]+;\s*/m, '');
  if (/\bpublic\s+class\s+Main\b/.test(withoutPkg)) {
    return withoutPkg;
  }
  return withoutPkg.replace(/\bpublic\s+class\s+([A-Za-z_][A-Za-z0-9_]*)\b/, 'public class Main');
}

interface MethodParam {
  type: string;
  name: string;
}

interface ParsedSignature {
  returnType: string;
  methodName: string;
  params: MethodParam[];
}

function normalizeTypeStr(rawType: string): string {
  return rawType
    .replace(/\bconst\b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*&\s*/g, '')
    .replace(/\s*\*\s*/g, '*')
    .replace(/\s*<\s*/g, '<')
    .replace(/\s*>\s*/g, '>')
    .replace(/\s*\[\s*\]/g, '[]')
    .trim();
}

function parseParamsList(paramText: string): MethodParam[] {
  const trimmed = paramText.trim();
  if (!trimmed || trimmed === 'void') return [];
  const parts: string[] = [];
  let cur = '';
  let angle = 0;
  for (const ch of trimmed) {
    if (ch === '<') angle++;
    else if (ch === '>') angle = Math.max(0, angle - 1);
    if (ch === ',' && angle === 0) {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur.trim());

  return parts.map((p, idx) => {
    const clean = p.replace(/\bfinal\b/g, '').trim();
    const match = clean.match(/^(.*?)[\s*&]+([A-Za-z_][A-Za-z0-9_]*)$/);
    if (!match) {
      return { type: normalizeTypeStr(clean), name: `arg${idx}` };
    }
    const rawType = clean.slice(0, clean.length - match[2].length).trim();
    return { type: normalizeTypeStr(rawType), name: match[2] };
  });
}

function extractSolutionMethodSignature(
  code: string,
  language: 'java' | 'cpp'
): ParsedSignature | null {
  const stripped = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  const solIdx = stripped.search(/\bclass\s+Solution\b/);
  const rawBody = solIdx >= 0 ? stripped.slice(solIdx) : stripped;
  const body = rawBody.replace(/\b(?:public|private|protected)\s*:/g, '\n');

  if (language === 'java') {
    const regex = /(?:^|\n|;|\{|\})\s*(?:(?:public|private|protected|static|final)\s+)*([A-Za-z0-9_<>\[\],\s]+?)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*(?:throws\s+[A-Za-z0-9_,\s]+)?\{/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(body)) !== null) {
      const cleanedRet = m[1].replace(/\b(?:public|private|protected|static|final)\b/g, '').trim();
      const ret = normalizeTypeStr(cleanedRet);
      const name = m[2].trim();
      if (name === 'Solution' || name === 'if' || name === 'while' || name === 'for' || name === 'switch') {
        continue;
      }
      if (!ret || ret === 'return' || ret === 'new' || ret === 'else') continue;
      return {
        returnType: ret,
        methodName: name,
        params: parseParamsList(m[3]),
      };
    }
    return null;
  }

  const regex = /(?:^|\n|;|\{|\})\s*(?:(?:virtual|inline|static|constexpr)\s+)*([A-Za-z0-9_:<>*&\s]+?)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*(?:const\s*)?\{/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(body)) !== null) {
    const cleanedRet = m[1]
      .replace(/\b(?:public|private|protected)\s*:/g, '')
      .replace(/\b(?:virtual|inline|static|constexpr)\b/g, '')
      .trim();
    const ret = normalizeTypeStr(cleanedRet);
    const name = m[2].trim();
    if (name === 'Solution' || name === 'if' || name === 'while' || name === 'for' || name === 'switch' || name === 'main') {
      continue;
    }
    if (!ret || ret === 'return' || ret === 'else') continue;
    return {
      returnType: ret,
      methodName: name,
      params: parseParamsList(m[3]),
    };
  }
  return null;
}

// ============================================================================
// JAVA HARNESS GENERATOR
// ============================================================================

function toJavaLiteral(type: string, value: any): string {
  const t = normalizeTypeStr(type);
  if (t === 'int') return String(Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0);
  if (t === 'long') return `${Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0}L`;
  if (t === 'boolean') return Boolean(value) ? 'true' : 'false';
  if (t === 'String') return `"${escapeQuoted(value ?? '')}"`;
  if (t === 'int[]') {
    const arr = Array.isArray(value) ? value.map((v) => Math.trunc(Number(v) || 0)) : [];
    return `new int[]{${arr.join(', ')}}`;
  }
  if (t === 'String[]') {
    const arr = Array.isArray(value) ? value.map((v) => `"${escapeQuoted(v)}"`) : [];
    return `new String[]{${arr.join(', ')}}`;
  }
  if (t === 'List<Integer>') {
    const arr = Array.isArray(value) ? value.map((v) => Math.trunc(Number(v) || 0)) : [];
    return `new ArrayList<>(Arrays.asList(${arr.join(', ')}))`;
  }
  if (t === 'List<String>') {
    const arr = Array.isArray(value) ? value.map((v) => `"${escapeQuoted(v)}"`) : [];
    return `new ArrayList<>(Arrays.asList(${arr.join(', ')}))`;
  }
  if (t === 'int[][]') {
    const rows = Array.isArray(value) ? value : [];
    const inner = rows.map((r: any) => `{${(Array.isArray(r) ? r : []).map((x) => Math.trunc(Number(x) || 0)).join(', ')}}`);
    return `new int[][]{${inner.join(', ')}}`;
  }
  if (t === 'char[][]') {
    const rows = Array.isArray(value) ? value : [];
    const inner = rows.map(
      (r: any) =>
        `{${(Array.isArray(r) ? r : [])
          .map((x) => {
            const ch = String(x ?? '0').charAt(0) || '0';
            return `'${ch === "'" || ch === '\\' ? '\\' + ch : ch}'`;
          })
          .join(', ')}}`
    );
    return `new char[][]{${inner.join(', ')}}`;
  }
  if (t === 'ListNode') {
    const arr = Array.isArray(value) ? value.map((v) => Math.trunc(Number(v) || 0)) : [];
    return `__J0Helper.arrayToList(new int[]{${arr.join(', ')}})`;
  }
  if (t === 'TreeNode') {
    const arr = Array.isArray(value)
      ? value.map((v) => (v === null || v === undefined ? 'null' : String(Math.trunc(Number(v) || 0))))
      : [];
    return `__J0Helper.arrayToTree(new Integer[]{${arr.join(', ')}})`;
  }
  return 'null';
}

function serializeJavaCallExpr(returnType: string, expr: string): string {
  const t = normalizeTypeStr(returnType);
  if (t === 'int' || t === 'long' || t === 'boolean') return `String.valueOf(${expr})`;
  if (t === 'String') return `__J0Helper.strJson(${expr})`;
  if (t === 'int[]') return `__J0Helper.intArrJson(${expr})`;
  if (t === 'String[]') return `__J0Helper.strArrJson(${expr})`;
  if (t === 'int[][]') return `__J0Helper.int2dJson(${expr})`;
  if (t === 'List<Integer>') return `__J0Helper.intListJson(${expr})`;
  if (t === 'List<String>') return `__J0Helper.strListJson(${expr})`;
  if (t === 'List<List<Integer>>') return `__J0Helper.int2dListJson(${expr})`;
  if (t === 'List<List<String>>') return `__J0Helper.str2dListJson(${expr})`;
  if (t === 'ListNode') return `__J0Helper.listToJson(${expr})`;
  if (t === 'TreeNode') return `__J0Helper.treeToJson(${expr})`;
  return `String.valueOf(${expr})`;
}

export function buildJavaChallengeDriver(
  userCode: string,
  testCases: DriverTestCase[],
  problemSlug?: string
): { wrappedCode: string } | null {
  if (/\bpublic\s+static\s+void\s+main\s*\(/.test(userCode)) {
    return null;
  }

  const isMinStack = problemSlug === 'min-stack' || /\bclass\s+MinStack\b/.test(userCode);
  const sig = isMinStack ? null : extractSolutionMethodSignature(userCode, 'java');
  if (!isMinStack && !sig) {
    return null;
  }

  const withoutPkg = userCode.replace(/^\s*package\s+[^;]+;\s*/gm, '');
  const userImports: string[] = [];
  const codeBody = withoutPkg
    .split(/\r?\n/)
    .filter((line) => {
      if (/^\s*import\s+[^;]+;\s*$/.test(line)) {
        userImports.push(line.trim());
        return false;
      }
      return true;
    })
    .join('\n')
    .replace(/\bpublic\s+class\s+(Solution|MinStack)\b/g, 'class $1');

  const hasListNode = /\bclass\s+ListNode\b/.test(codeBody);
  const hasTreeNode = /\bclass\s+TreeNode\b/.test(codeBody);

  const casesBlocks = testCases.map((tc, idx) => {
    const args = parseRawInputArgs(tc.input);
    if (isMinStack) {
      const ops: string[] = Array.isArray(args[0]) ? args[0].map((x) => `"${escapeQuoted(x)}"`) : [];
      const vals: number[][] = Array.isArray(args[1]) ? args[1] : [];
      const valsJava = vals
        .map((row) => `{${(Array.isArray(row) ? row : []).map((n) => Math.trunc(Number(n) || 0)).join(', ')}}`)
        .join(', ');
      return `
        try {
          String[] __ops = new String[]{${ops.join(', ')}};
          int[][] __vals = new int[][]{${valsJava}};
          MinStack __ms = null;
          StringBuilder __sb = new StringBuilder("[");
          for (int __i = 0; __i < __ops.length; __i++) {
            if (__i > 0) __sb.append(",");
            String __op = __ops[__i];
            if ("MinStack".equals(__op)) {
              __ms = new MinStack();
              __sb.append("null");
            } else if ("push".equals(__op)) {
              __ms.push(__vals[__i][0]);
              __sb.append("null");
            } else if ("pop".equals(__op)) {
              __ms.pop();
              __sb.append("null");
            } else if ("top".equals(__op)) {
              __sb.append(__ms.top());
            } else if ("getMin".equals(__op)) {
              __sb.append(__ms.getMin());
            } else {
              __sb.append("null");
            }
          }
          __sb.append("]");
          System.out.println("__CASE_OUT__${idx}__:" + __sb.toString());
        } catch (Throwable __t) {
          System.out.println("__CASE_ERR__${idx}__:" + __t.getClass().getSimpleName() + ": " + String.valueOf(__t.getMessage()).replace('\\n', ' '));
        }`;
    }

    const params = sig!.params;
    const decls: string[] = [];
    const callArgs: string[] = [];

    if (problemSlug === 'linked-list-cycle' && params.length === 1 && params[0].type === 'ListNode') {
      const arr = Array.isArray(args[0]) ? args[0].map((v) => Math.trunc(Number(v) || 0)) : [];
      const pos = Number.isFinite(Number(args[1])) ? Math.trunc(Number(args[1])) : -1;
      decls.push(`ListNode __arg0 = __J0Helper.makeCycleList(new int[]{${arr.join(', ')}}, ${pos});`);
      callArgs.push('__arg0');
    } else {
      for (let pIdx = 0; pIdx < params.length; pIdx++) {
        const p = params[pIdx];
        decls.push(`${p.type} __arg${pIdx} = ${toJavaLiteral(p.type, args[pIdx])};`);
        callArgs.push(`__arg${pIdx}`);
      }
    }

    const callStmt =
      sig!.returnType === 'void'
        ? `__sol.${sig!.methodName}(${callArgs.join(', ')});\n          String __out = ${serializeJavaCallExpr(params[0]?.type || 'int[]', '__arg0')};`
        : `${sig!.returnType} __res = __sol.${sig!.methodName}(${callArgs.join(', ')});\n          String __out = ${serializeJavaCallExpr(sig!.returnType, '__res')};`;

    return `
        try {
          Solution __sol = new Solution();
          ${decls.join('\n          ')}
          ${callStmt}
          System.out.println("__CASE_OUT__${idx}__:" + __out);
        } catch (Throwable __t) {
          System.out.println("__CASE_ERR__${idx}__:" + __t.getClass().getSimpleName() + ": " + String.valueOf(__t.getMessage()).replace('\\n', ' '));
        }`;
  });

  const imports = Array.from(new Set(['import java.util.*;', ...userImports])).join('\n');

  const nodeDefs = [
    hasListNode ? '' : `class ListNode { int val; ListNode next; ListNode() {} ListNode(int x) { val = x; } ListNode(int x, ListNode n) { val = x; next = n; } }`,
    hasTreeNode ? '' : `class TreeNode { int val; TreeNode left; TreeNode right; TreeNode() {} TreeNode(int x) { val = x; } TreeNode(int x, TreeNode l, TreeNode r) { val = x; left = l; right = r; } }`,
  ]
    .filter(Boolean)
    .join('\n');

  const wrappedCode = `${imports}

${nodeDefs}

${codeBody}

class __J0Helper {
  static ListNode arrayToList(int[] arr) {
    if (arr == null || arr.length == 0) return null;
    ListNode head = new ListNode(arr[0]);
    ListNode curr = head;
    for (int i = 1; i < arr.length; i++) {
      curr.next = new ListNode(arr[i]);
      curr = curr.next;
    }
    return head;
  }

  static ListNode makeCycleList(int[] arr, int pos) {
    ListNode head = arrayToList(arr);
    if (head == null || pos < 0) return head;
    ListNode cycle = null, tail = head;
    int idx = 0;
    while (tail != null) {
      if (idx == pos) cycle = tail;
      if (tail.next == null) break;
      tail = tail.next;
      idx++;
    }
    if (cycle != null && tail != null) tail.next = cycle;
    return head;
  }

  static TreeNode arrayToTree(Integer[] arr) {
    if (arr == null || arr.length == 0 || arr[0] == null) return null;
    TreeNode root = new TreeNode(arr[0]);
    Queue<TreeNode> q = new LinkedList<>();
    q.offer(root);
    int i = 1;
    while (!q.isEmpty() && i < arr.length) {
      TreeNode node = q.poll();
      if (i < arr.length && arr[i] != null) {
        node.left = new TreeNode(arr[i]);
        q.offer(node.left);
      }
      i++;
      if (i < arr.length && arr[i] != null) {
        node.right = new TreeNode(arr[i]);
        q.offer(node.right);
      }
      i++;
    }
    return root;
  }

  static String strJson(String s) {
    if (s == null) return "null";
    return "\\"" + s.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"") + "\\"";
  }

  static String intArrJson(int[] a) {
    if (a == null) return "[]";
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < a.length; i++) {
      if (i > 0) sb.append(",");
      sb.append(a[i]);
    }
    return sb.append("]").toString();
  }

  static String strArrJson(String[] a) {
    if (a == null) return "[]";
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < a.length; i++) {
      if (i > 0) sb.append(",");
      sb.append(strJson(a[i]));
    }
    return sb.append("]").toString();
  }

  static String int2dJson(int[][] a) {
    if (a == null) return "[]";
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < a.length; i++) {
      if (i > 0) sb.append(",");
      sb.append(intArrJson(a[i]));
    }
    return sb.append("]").toString();
  }

  static String intListJson(List<Integer> a) {
    if (a == null) return "[]";
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < a.size(); i++) {
      if (i > 0) sb.append(",");
      sb.append(a.get(i));
    }
    return sb.append("]").toString();
  }

  static String strListJson(List<String> a) {
    if (a == null) return "[]";
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < a.size(); i++) {
      if (i > 0) sb.append(",");
      sb.append(strJson(a.get(i)));
    }
    return sb.append("]").toString();
  }

  static String int2dListJson(List<List<Integer>> a) {
    if (a == null) return "[]";
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < a.size(); i++) {
      if (i > 0) sb.append(",");
      sb.append(intListJson(a.get(i)));
    }
    return sb.append("]").toString();
  }

  static String str2dListJson(List<List<String>> a) {
    if (a == null) return "[]";
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < a.size(); i++) {
      if (i > 0) sb.append(",");
      sb.append(strListJson(a.get(i)));
    }
    return sb.append("]").toString();
  }

  static String listToJson(ListNode head) {
    StringBuilder sb = new StringBuilder("[");
    Set<ListNode> seen = new HashSet<>();
    ListNode curr = head;
    boolean first = true;
    int guard = 0;
    while (curr != null && seen.add(curr) && guard++ < 2000) {
      if (!first) sb.append(",");
      first = false;
      sb.append(curr.val);
      curr = curr.next;
    }
    return sb.append("]").toString();
  }

  static String treeToJson(TreeNode root) {
    if (root == null) return "[]";
    List<String> out = new ArrayList<>();
    Queue<TreeNode> q = new LinkedList<>();
    q.offer(root);
    while (!q.isEmpty() && out.size() < 4000) {
      TreeNode n = q.poll();
      if (n != null) {
        out.add(String.valueOf(n.val));
        q.offer(n.left);
        q.offer(n.right);
      } else {
        out.add("null");
      }
    }
    while (!out.isEmpty() && "null".equals(out.get(out.size() - 1))) {
      out.remove(out.size() - 1);
    }
    return "[" + String.join(",", out) + "]";
  }
}

public class Main {
  public static void main(String[] args) {
${casesBlocks.join('\n')}
  }
}
`;

  return { wrappedCode };
}

// ============================================================================
// C++ HARNESS GENERATOR
// ============================================================================

function toCppDecl(varName: string, type: string, value: any): string {
  const t = normalizeTypeStr(type);
  if (t === 'int') {
    const n = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0;
    return `int ${varName} = ${n};`;
  }
  if (t === 'long' || t === 'long long') {
    const n = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0;
    return `${t} ${varName} = ${n}LL;`;
  }
  if (t === 'bool') {
    return `bool ${varName} = ${Boolean(value) ? 'true' : 'false'};`;
  }
  if (t === 'string' || t === 'std::string') {
    return `string ${varName} = "${escapeQuoted(value ?? '')}";`;
  }
  if (t === 'vector<int>' || t === 'std::vector<int>') {
    const arr = Array.isArray(value) ? value.map((v) => Math.trunc(Number(v) || 0)) : [];
    return `vector<int> ${varName} = {${arr.join(', ')}};`;
  }
  if (t === 'vector<string>' || t === 'std::vector<string>') {
    const arr = Array.isArray(value) ? value.map((v) => `"${escapeQuoted(v)}"`) : [];
    return `vector<string> ${varName} = {${arr.join(', ')}};`;
  }
  if (t === 'vector<vector<int>>' || t === 'std::vector<vector<int>>') {
    const rows = Array.isArray(value) ? value : [];
    const inner = rows.map((r: any) => `{${(Array.isArray(r) ? r : []).map((x) => Math.trunc(Number(x) || 0)).join(', ')}}`);
    return `vector<vector<int>> ${varName} = {${inner.join(', ')}};`;
  }
  if (t === 'vector<vector<char>>' || t === 'std::vector<vector<char>>') {
    const rows = Array.isArray(value) ? value : [];
    const inner = rows.map(
      (r: any) =>
        `{${(Array.isArray(r) ? r : [])
          .map((x) => {
            const ch = String(x ?? '0').charAt(0) || '0';
            return `'${ch === "'" || ch === '\\' ? '\\' + ch : ch}'`;
          })
          .join(', ')}}`
    );
    return `vector<vector<char>> ${varName} = {${inner.join(', ')}};`;
  }
  if (t === 'ListNode*') {
    const arr = Array.isArray(value) ? value.map((v) => Math.trunc(Number(v) || 0)) : [];
    return `ListNode* ${varName} = __j0_arrayToList({${arr.join(', ')}});`;
  }
  if (t === 'TreeNode*') {
    const arr = Array.isArray(value)
      ? value.map((v) => (v === null || v === undefined ? '{false,0}' : `{true,${Math.trunc(Number(v) || 0)}}`))
      : [];
    return `TreeNode* ${varName} = __j0_arrayToTree({${arr.join(', ')}});`;
  }
  return `int ${varName} = 0;`;
}

function serializeCppExpr(returnType: string, expr: string): string {
  const t = normalizeTypeStr(returnType).replace(/^std::/, '');
  if (t === 'int' || t === 'long' || t === 'long long') return `to_string(${expr})`;
  if (t === 'bool') return `string((${expr}) ? "true" : "false")`;
  if (t === 'string') return `__j0_strJson(${expr})`;
  if (t === 'vector<int>') return `__j0_vecIntJson(${expr})`;
  if (t === 'vector<string>') return `__j0_vecStrJson(${expr})`;
  if (t === 'vector<vector<int>>') return `__j0_vec2dIntJson(${expr})`;
  if (t === 'vector<vector<string>>') return `__j0_vec2dStrJson(${expr})`;
  if (t === 'ListNode*') return `__j0_listToJson(${expr})`;
  if (t === 'TreeNode*') return `__j0_treeToJson(${expr})`;
  return `to_string(${expr})`;
}

export function buildCppChallengeDriver(
  userCode: string,
  testCases: DriverTestCase[],
  problemSlug?: string
): { wrappedCode: string } | null {
  if (/\bint\s+main\s*\(/.test(userCode)) {
    return null;
  }

  const isMinStack = problemSlug === 'min-stack' || /\bclass\s+MinStack\b/.test(userCode);
  const sig = isMinStack ? null : extractSolutionMethodSignature(userCode, 'cpp');
  if (!isMinStack && !sig) {
    return null;
  }

  const hasListNode = /struct\s+ListNode\b|class\s+ListNode\b/.test(userCode);
  const hasTreeNode = /struct\s+TreeNode\b|class\s+TreeNode\b/.test(userCode);

  const casesBlocks = testCases.map((tc, idx) => {
    const args = parseRawInputArgs(tc.input);
    if (isMinStack) {
      const ops: string[] = Array.isArray(args[0]) ? args[0].map((x) => `"${escapeQuoted(x)}"`) : [];
      const vals: number[][] = Array.isArray(args[1]) ? args[1] : [];
      const valsCpp = vals
        .map((row) => `{${(Array.isArray(row) ? row : []).map((n) => Math.trunc(Number(n) || 0)).join(', ')}}`)
        .join(', ');
      return `  {
    vector<string> __ops = {${ops.join(', ')}};
    vector<vector<int>> __vals = {${valsCpp}};
    MinStack* __ms = nullptr;
    string __out = "[";
    for (size_t __i = 0; __i < __ops.size(); ++__i) {
      if (__i > 0) __out += ",";
      const string& __op = __ops[__i];
      if (__op == "MinStack") { __ms = new MinStack(); __out += "null"; }
      else if (__op == "push") { __ms->push(__vals[__i][0]); __out += "null"; }
      else if (__op == "pop") { __ms->pop(); __out += "null"; }
      else if (__op == "top") { __out += to_string(__ms->top()); }
      else if (__op == "getMin") { __out += to_string(__ms->getMin()); }
      else { __out += "null"; }
    }
    __out += "]";
    cout << "__CASE_OUT__${idx}__:" << __out << endl;
  }`;
    }

    const params = sig!.params;
    const decls: string[] = [];
    const callArgs: string[] = [];

    if (problemSlug === 'linked-list-cycle' && params.length === 1 && params[0].type === 'ListNode*') {
      const arr = Array.isArray(args[0]) ? args[0].map((v) => Math.trunc(Number(v) || 0)) : [];
      const pos = Number.isFinite(Number(args[1])) ? Math.trunc(Number(args[1])) : -1;
      decls.push(`ListNode* __arg0 = __j0_makeCycleList({${arr.join(', ')}}, ${pos});`);
      callArgs.push('__arg0');
    } else {
      for (let pIdx = 0; pIdx < params.length; pIdx++) {
        const p = params[pIdx];
        decls.push(toCppDecl(`__arg${pIdx}`, p.type, args[pIdx]));
        callArgs.push(`__arg${pIdx}`);
      }
    }

    const callBlock =
      sig!.returnType === 'void'
        ? `    __sol.${sig!.methodName}(${callArgs.join(', ')});\n    string __out = ${serializeCppExpr(params[0]?.type || 'vector<int>', '__arg0')};`
        : `    auto __res = __sol.${sig!.methodName}(${callArgs.join(', ')});\n    string __out = ${serializeCppExpr(sig!.returnType, '__res')};`;

    return `  {
    Solution __sol;
    ${decls.join('\n    ')}
${callBlock}
    cout << "__CASE_OUT__${idx}__:" << __out << endl;
  }`;
  });

  const nodeDefs = [
    hasListNode ? '' : `struct ListNode { int val; ListNode *next; ListNode() : val(0), next(nullptr) {} ListNode(int x) : val(x), next(nullptr) {} ListNode(int x, ListNode *n) : val(x), next(n) {} };`,
    hasTreeNode ? '' : `struct TreeNode { int val; TreeNode *left; TreeNode *right; TreeNode() : val(0), left(nullptr), right(nullptr) {} TreeNode(int x) : val(x), left(nullptr), right(nullptr) {} TreeNode(int x, TreeNode *l, TreeNode *r) : val(x), left(l), right(r) {} };`,
  ]
    .filter(Boolean)
    .join('\n');

  const wrappedCode = `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <map>
#include <set>
#include <stack>
#include <queue>
#include <deque>
#include <algorithm>
#include <numeric>
#include <climits>
#include <cmath>
using namespace std;

${nodeDefs}

struct __J0TVal { bool ok; int v; };

static ListNode* __j0_arrayToList(const vector<int>& arr) {
  if (arr.empty()) return nullptr;
  ListNode* head = new ListNode(arr[0]);
  ListNode* curr = head;
  for (size_t i = 1; i < arr.size(); ++i) {
    curr->next = new ListNode(arr[i]);
    curr = curr->next;
  }
  return head;
}

static ListNode* __j0_makeCycleList(const vector<int>& arr, int pos) {
  ListNode* head = __j0_arrayToList(arr);
  if (!head || pos < 0) return head;
  ListNode* cycle = nullptr;
  ListNode* tail = head;
  int idx = 0;
  while (tail) {
    if (idx == pos) cycle = tail;
    if (!tail->next) break;
    tail = tail->next;
    ++idx;
  }
  if (cycle && tail) tail->next = cycle;
  return head;
}

static TreeNode* __j0_arrayToTree(const vector<__J0TVal>& arr) {
  if (arr.empty() || !arr[0].ok) return nullptr;
  TreeNode* root = new TreeNode(arr[0].v);
  queue<TreeNode*> q;
  q.push(root);
  size_t i = 1;
  while (!q.empty() && i < arr.size()) {
    TreeNode* n = q.front();
    q.pop();
    if (i < arr.size() && arr[i].ok) {
      n->left = new TreeNode(arr[i].v);
      q.push(n->left);
    }
    ++i;
    if (i < arr.size() && arr[i].ok) {
      n->right = new TreeNode(arr[i].v);
      q.push(n->right);
    }
    ++i;
  }
  return root;
}

static string __j0_strJson(const string& s) {
  string out = "\\"";
  for (char c : s) {
    if (c == '\\\\') out += "\\\\\\\\";
    else if (c == '\\"') out += "\\\\\\"";
    else out += c;
  }
  out += "\\"";
  return out;
}

static string __j0_vecIntJson(const vector<int>& a) {
  string s = "[";
  for (size_t i = 0; i < a.size(); ++i) {
    if (i > 0) s += ",";
    s += to_string(a[i]);
  }
  return s + "]";
}

static string __j0_vecStrJson(const vector<string>& a) {
  string s = "[";
  for (size_t i = 0; i < a.size(); ++i) {
    if (i > 0) s += ",";
    s += __j0_strJson(a[i]);
  }
  return s + "]";
}

static string __j0_vec2dIntJson(const vector<vector<int>>& a) {
  string s = "[";
  for (size_t i = 0; i < a.size(); ++i) {
    if (i > 0) s += ",";
    s += __j0_vecIntJson(a[i]);
  }
  return s + "]";
}

static string __j0_vec2dStrJson(const vector<vector<string>>& a) {
  string s = "[";
  for (size_t i = 0; i < a.size(); ++i) {
    if (i > 0) s += ",";
    s += __j0_vecStrJson(a[i]);
  }
  return s + "]";
}

static string __j0_listToJson(ListNode* head) {
  string s = "[";
  unordered_set<ListNode*> seen;
  ListNode* curr = head;
  bool first = true;
  int guard = 0;
  while (curr && seen.find(curr) == seen.end() && guard++ < 2000) {
    seen.insert(curr);
    if (!first) s += ",";
    first = false;
    s += to_string(curr->val);
    curr = curr->next;
  }
  return s + "]";
}

static string __j0_treeToJson(TreeNode* root) {
  if (!root) return "[]";
  vector<string> out;
  queue<TreeNode*> q;
  q.push(root);
  while (!q.empty() && out.size() < 4000) {
    TreeNode* n = q.front();
    q.pop();
    if (n) {
      out.push_back(to_string(n->val));
      q.push(n->left);
      q.push(n->right);
    } else {
      out.push_back("null");
    }
  }
  while (!out.empty() && out.back() == "null") {
    out.pop_back();
  }
  string s = "[";
  for (size_t i = 0; i < out.size(); ++i) {
    if (i > 0) s += ",";
    s += out[i];
  }
  return s + "]";
}

${userCode}

int main() {
${casesBlocks.join('\n')}
  return 0;
}
`;

  return { wrappedCode };
}

