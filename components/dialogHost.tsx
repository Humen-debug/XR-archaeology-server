import { v4 as uuid } from "uuid";
import { ReactNode, Component } from "react";
import _ from "lodash";
import Dialog from "./dialogs/basicDialog";

export type ComponentType = (props: any) => ReactNode;

/**
 * @param component specifies what component to be rendered in the dialog.
 * It accepts functional component and import of file by using `import`.
 * It is important that the component using `import` must be exported as default.
 * @param props: property of the `component`
 * @param className: css style className of the dialog
 */
interface DialogProps<P> {
  component: Promise<ComponentType | any> | ComponentType;
  props: P;
  className?: string;
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}

interface IDialogItem<P extends {}> {
  readonly key: string;
  component?: Promise<ComponentType | any> | ComponentType;
  readonly show?: boolean;
  props?: P;
  loading?: boolean;
  hide?: (result?: any, error?: any) => void;
  className?: string;
}

class DialogItem<P extends {}> implements IDialogItem<P> {
  public key: string;
  private _show: boolean;
  public component?: ComponentType;
  public props?: P;
  public loading?: boolean;
  public hide?: (result?: any, error?: any) => void;
  public className?: string;

  constructor(component?: ComponentType, props?: P, loading = false, hide?: (result?: any, error?: any) => void, className?: string) {
    this.key = `${uuid()}${new Date().getTime()}`;
    this._show = true;
    this.component = component;
    this.props = props;
    this.loading = loading;
    this.hide = hide;
    this.className = className;
  }

  public get show() {
    return this._show;
  }

  public set show(value) {
    this._show = value;
    if (!value) {
      this.hide();
    }
  }
}

type DialogHostState = {
  dialogs: DialogItem<any>[];
};

class DialogHost extends Component<{}, DialogHostState> {
  constructor(props: any) {
    super(props);
    this.state = { dialogs: [] };
    this.openDialog = this.openDialog.bind(this);
    this.modalResult = this.modalResult.bind(this);
  }
  public openDialog(props: DialogProps<any>) {
    let item: DialogItem<any>;
    const hide = (result?: any, error?: any) => {
      if (!item.show) return;
      item.show = false;
      if (error) {
        props.reject(error);
      } else {
        props.resolve(result);
      }
      setTimeout(() => {
        const idx = this.state.dialogs.indexOf(item);
        idx !== -1 &&
          this.setState((state) => {
            let dialogs = state.dialogs;
            dialogs.splice(idx, 1);
            return { ...state, dialogs: dialogs };
          });
      }, 500);
    };
    item = new DialogItem(null, props.props, false, hide, props.className);
    if (props.component instanceof Promise && props.component.then) {
      item.loading = true;
      props.component
        .then((component) => {
          item.loading = false;
          item.component = component.default || component;
          // set dialog loading as false
          this.setState((state) => ({
            dialogs: _.map(state.dialogs, (dialog) => {
              if (dialog.key === item.key) return item;
              else return dialog;
            }),
          }));
        })
        .catch((e) => {
          console.warn(e);
          hide(undefined, e);
        });
    } else if (props.component instanceof Function) {
      item.component = props.component;
    }
    this.setState((state) => ({
      dialogs: [...state.dialogs, item],
    }));
  }

  public modalResult({ id, result }: { id: string; result?: any }) {
    const dialog = this.state.dialogs.find((it) => it.key === id);
    if (dialog) dialog.hide(result);
  }

  render(): ReactNode {
    return (
      <div className="w-full">
        {this.state.dialogs.map((dialog) => {
          return (
            <Dialog
              key={dialog.key}
              modalId={dialog.key}
              modalResult={this.modalResult}
              props={dialog.props}
              ref={(node) => {
                if (!node) return;
                dialog.show ? node.showModal() : node.close();
              }}
              className={dialog.className}
            >
              {dialog.loading ? (
                <div className="flex flex-col h-full w-full justify-center items-center">
                  <div className="loader" />
                </div>
              ) : (
                dialog.component
              )}
            </Dialog>
          );
        })}
      </div>
    );
  }
}

export default DialogHost;
