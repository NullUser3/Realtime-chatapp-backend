export class httpsErrors extends Error {
  constructor(status,message2="") {
    super();
    this.status = status;
    this.message2 = message2;
    this.message = this.ErrorHandler(status,message2);
  }
  ErrorHandler(status,message2) {
    switch (status) {
      case 404:
        return "resource not found"+message2;
      case 401:
        return "resource not autorized"+message2;
      case 409:
        return "resource already in use"+message2;
      default:
        return "unexpected error occured"+message2;
    }
  }
}
