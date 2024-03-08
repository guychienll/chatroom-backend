import AuthGuard from "@/decorator/AuthGuard";
import ErrorHandler from "@/decorator/ErrorHandler";
import IChatService from "@/interface/IChatService";
import { Request, Response } from "@/types/Http";

class ChatController {
  private chatService: IChatService;

  constructor(chatService: IChatService) {
    this.chatService = chatService;
    this.getUserRooms = this.getUserRooms.bind(this);
  }

  @ErrorHandler()
  @AuthGuard()
  async getUserRooms(req: Request, res: Response) {
    //TODO: to shallow down profile , because auth guard can guaranty that profile is not null
    const rooms = await this.chatService.getUserRooms(
      req.session.profile!.username
    );

    res.status(200).send(rooms);
  }
}

export default ChatController;
