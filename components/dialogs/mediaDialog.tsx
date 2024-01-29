import { MdAdd, MdFilePresent, MdRefresh } from "react-icons/md";
import DataTable from "../data-table/dataTable";
import { DialogProps } from "./basicDialog";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useFeathersContext } from "@/contexts/feathers";
import { v4 as uuid } from "uuid";
import _ from "lodash";
import moment from "moment";

export interface MediaLibraryProps<T> extends DialogProps<T> {
  type?: string; // default image/*
  multiple?: boolean;
}

export interface MediaProps<T> {
  item?: T;
  index?: number;
  [key: string]: any;
}

function regEscape(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, (c) => {
    switch (c) {
      case "*":
        return ".*";
      default:
        return `\\${c}`;
    }
  });
}

function MediaDialog<T extends any>(props: MediaLibraryProps<T>) {
  const uploadRef = useRef(null);
  const feathers = useFeathersContext();
  const [file, setFile] = useState<File>();
  const [selectItem, setSelectItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const cancel = () => {
    props.modalResult?.(false);
  };

  const save = async () => {
    if (!selectItem) {
      cancel();
      return;
    }
    setLoading(true);
    try {
      const res = (await feathers.service("attachments").find({ query: { _id: selectItem._id, $limit: 100 } })).data;
      if (!res.length) {
        cancel();
        return;
      }
      props.modalResult(res);
    } catch (error) {
      alert("Fail to set attachment");
      console.warn(`Fail to patch attachment ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const pickItem = (item: any) => {
    setSelectItem((it) => {
      if (it?._id === item._id) return null;
      else return item;
    });
  };

  const getThumbURL = (item: any) => {
    if (feathers.apiURL && item._id) {
      return `${feathers.apiURL}/attachments/${item._id}.jpeg`;
    }
  };

  const renderItem = (props: MediaProps<any>) => {
    const type = props.item.type;
    let content: JSX.Element;
    if (type === "image") {
      content = (
        <div className="w-full h-full relative">
          <img src={getThumbURL(props.item)} className="w-full h-full object-contain" />
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-black bg-opacity-60 text-white p-1">
            <p>{props.item.name}</p>
          </div>
        </div>
      );
    } else {
      content = (
        <div className="flex flex-col items-center justify-center w-full h-full relative">
          <MdFilePresent size={64} className="mb-2" />
          <p className="absolute bottom-2 h-1/4">{props.item.name}</p>
        </div>
      );
    }
    const isActive = selectItem?._id === props.item._id;
    return (
      <div className={`item-container ${isActive ? "active" : ""}`} key={props.index} onClick={() => pickItem(props.item)}>
        {content}
      </div>
    );
  };

  const getMimeType = () => {
    if (!props.type || props.type === "*" || props.type === "*/*") {
      return {};
    }
    const type = { $regex: `^${regEscape(props.type)}` };
    return {
      mime: type,
    };
  };

  const handleOnUploadPress = () => {
    uploadRef.current?.click();
  };

  const uploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) setFile(files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    var data = new FormData();
    data.append("file", file, file.name);

    const info = {
      name: file.name,
      size: file.size,
      mime: file.type,
      thumb: null,
      id: uuid(),
      success: false,
      complete: false,
      processing: true,
      error: null,
      progress: 0,
    };
    try {
      console.log("start upload", data);
      const response = await feathers.post("attachments/upload", data, {
        onUploadProgress: (progressEvent) => {
          info.progress = progressEvent.loaded / progressEvent.total;
        },
      });
      console.log(response);
      const rinfo = (response.data || {}).info || {};
      _.assign(info, rinfo);
      info.success = true;
      info.complete = true;
      info.progress = 1;
      info.processing = false;
    } catch (e) {
      info.error = e.message;
      info.complete = true;
      info.processing = false;
      console.warn("Upload attachment fails:", e);
      alert("Upload attachment failed");
    }
  };

  useEffect(() => {
    handleUpload();
  }, [file]);

  const getHeaders = () => {
    if (!selectItem) return [];
    return [
      { title: "ID", value: selectItem._id },
      { title: "Name", value: selectItem.name },
      { title: "Date", value: moment(selectItem.date).format("lll") },
      { title: "Source", value: selectItem.src },
      { title: "MIME", value: selectItem.mime },
      ...(selectItem.width
        ? [
            { title: "Width", value: selectItem.width },
            { title: "Height", value: selectItem.height },
          ]
        : []),
      ...(selectItem.duration ? [{ title: "Duration", value: selectItem.duration }] : []),
    ];
  };

  return (
    <div className="h-full w-full flex flex-col p-6">
      <div className="h-full grid grid-cols-12 gap-x-3">
        <div className="md:col-span-6 col-span-12 h-full">
          <div className="flex flex-col flex-grow  h-full">
            <div className="flex flex-row justify-end items-center gap-3">
              <button className="h-9 w-9 flex center rounded-full hover:bg-gray-200">
                <MdRefresh size={24} />
              </button>
              <div>
                <button className="h-9 w-9 flex center rounded-full hover:bg-gray-200" onClick={handleOnUploadPress}>
                  <MdAdd size={24} />
                </button>
                <input type="file" ref={uploadRef} multiple={props.multiple ?? false} hidden onChange={uploadFile} />
              </div>
            </div>
            {/* TODO grid table selector*/}
            <DataTable
              path="/attachments"
              renderItem={renderItem}
              query={{
                $sort: { date: -1 },
                ...getMimeType(),
              }}
            />
          </div>
        </div>
        <div className="md:col-span-6 col-span-12 overflow-y-hidden">
          <div className="flex flex-col ">
            <p className="text-lg">Details</p>
            <div className="scrollable flex-grow h-full overflow-y-auto">
              <div className="flex flex-col gap-5 p-4">
                {getHeaders().map((header, index) => (
                  <div key={index}>
                    <p className="text-gray-700">{header.title}</p>
                    <p className="text-gray-400"> {header.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center mt-4 gap-6">
        <button disabled={loading} onClick={save} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 min-w-24 rounded">
          Save
        </button>
        <button disabled={loading} onClick={cancel} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 min-w-24 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default MediaDialog;