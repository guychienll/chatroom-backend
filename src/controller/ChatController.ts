import ErrorHandler from "@/decorator/ErrorHandler";
import ChatService from "@/service/ChatService";
import { Request, Response } from "@/types/Http";

class ChatController {
  private chatService;

  constructor(chatService: ChatService) {
    this.chatService = chatService;
    this.getUserRooms = this.getUserRooms.bind(this);
  }

  @ErrorHandler()
  async getUserRooms(req: Request, res: Response) {
    const rooms = await this.chatService.getUserRooms(
      req.session.profile.username
    );

    res.status(200).send(rooms);
  }
}

export default ChatController;
