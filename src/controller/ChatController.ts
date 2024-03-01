import ErrorHandler from "@/decorator/ErrorHandler";

class ChatController {
  private chatService;

  constructor(chatService) {
    this.chatService = chatService;
    this.getUserRooms = this.getUserRooms.bind(this);
  }

  @ErrorHandler()
  async getUserRooms(req, res) {
    const rooms = await this.chatService.getUserRooms(
      req.session.profile.username
    );
    res.status(200).send(rooms);
  }
}

export default ChatController;
