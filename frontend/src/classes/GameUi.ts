export default class GameUi {
  public rootEl = document.createElement('div');

  private _infoText: string | null = null;
  public get infoText(): string | null {
    return this._infoText;
  }
  public set infoText(v: string | null) {
    this._infoText = v;
    this.renderInfoBar();
  }
  
  private _infoTextVisibleOnPointer: boolean = false;
  public get infoTextVisibleOnPointer(): boolean {
    return this._infoTextVisibleOnPointer;
  }
  public set infoTextVisibleOnPointer(v: boolean) {
    this._infoTextVisibleOnPointer = v;
    this.renderInfoBar();
  }
  
  private _command: string = 'walk';
  public get command(): string {
    return this._command;
  }
  public set command(v: string) {
    this._command = v;
    this.renderInfoBar();
  }
  
  private _commands: {[key: string]: string} = {};
  public get commands(): {[key: string]: string} {
    return this._commands;
  }
  public set commands(v: {[key: string]: string}) {
    this._commands = v;
    this.renderBar();
    this.renderInfoBar();
  }

  public addCommand(key: string, label: string) {
    this.commands[key] = label;
    this.renderBar();
    this.renderInfoBar();
  }

  constructor() {
    this.rootEl.classList.add('gameUi')
    document.body.append(this.rootEl);

    this.renderBar()
    this.renderInfoBar()
  }

  private renderBar() {
    this.rootEl.innerHTML = ' '

    for (const command in this.commands) {
      if (Object.prototype.hasOwnProperty.call(this.commands, command)) {
        const label = this.commands[command];
        const button = document.createElement('button');
        button.addEventListener('click', ()=> this.command = command);
        button.innerText = label;

        this.rootEl.append(button);
      }
    }

    
    const bootButton = document.createElement('button');
    bootButton.addEventListener('click', window.PacdkRun);
    bootButton.innerText = 'Start!';
    this.rootEl.append(bootButton);
    
    const infoLine = document.createElement('span');
    infoLine.classList.add('infoLine')
    this.rootEl.append(infoLine);
  }
  
  private renderInfoBar() {
      let command = '';
      switch (this._command) {
        case 'walk':
          command = window.PacdkInternalVariablesModel.Walktext;
          break;
      
        default:
          command = this.commands[this._command];
          break;
      }

      let line = command;
      if (this.infoText)
        line +=` ${this._infoText}`;

      this.rootEl.querySelector('.infoLine')!.innerHTML = line;
  }
}
