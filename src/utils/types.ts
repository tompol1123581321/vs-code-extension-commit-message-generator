export type BranchData = {
  ticketId: string;
  context: string;
  type: string;
};

export type Repo = {
  state: { onDidChange: (arg0: () => void) => void; HEAD: { name: any } };
  inputBox: { value: any; onDidChange: (arg0: () => void) => void };
};
