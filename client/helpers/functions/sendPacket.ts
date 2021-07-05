export function sendPacket(
  success: number,
  message: string,
  content: { [key: string]: any } = {}
) {
  return { success: success, message: message, content: content };
}

export type IJson = { [k: string]: any };
export type IStatus = number;
export type IPacket = {
  successful: boolean;
  message: string;
  status: IStatus;
  content?: IJson;
};

export const createPacket = (
  successful: boolean,
  status: IStatus,
  message: string,
  content?: IJson
): IPacket => {
  return { successful, status, message, content };
};
