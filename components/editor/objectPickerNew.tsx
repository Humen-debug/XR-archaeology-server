import { useFeathers } from "@/contexts/feathers";
import { useSchemasContext } from "@/contexts/schemas";
import { getNameField, getNameFields } from "@/contexts/schemas/utils";
import { SchemaFieldJson } from "@/server/feathers/schema";
import _ from "lodash";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";

export interface Props {
  path: string;
  idProperty?: string;
  multiple?: boolean; // default true
  items?: any[];
  returnObject?: boolean;
  query?: any;
  inputValue?: any | any[];
  onChange?: (value: any | any[]) => void;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * [ObjectPickerNew] is used only when the length of items is less than 20.
 * @param props
 * @returns A list of items for selection.
 */
function ObjectPickerNew({ path, returnObject, query, inputValue, onChange, required, disabled, readOnly, ...props }: Props) {
  const schemas = useSchemasContext();
  const feathers = useFeathers();
  const idProperty = props.idProperty ?? "_id";
  const multiple = props.multiple ?? true;

  const [nameFields, setNameFields] = useState<SchemaFieldJson[]>([]);
  const [items, setItems] = useState(props.items ?? []);

  useLayoutEffect(() => {
    updateResolve();
    syncData();
  }, [path, query]);

  const updateResolve = async () => {
    if (path) {
      await schemas.init();
      const refRoute = schemas.lookupRoute(path);
      const refTable = refRoute?.def;
      if (!refTable) return;
      const nameField = getNameField(refTable);
      const nameFields = getNameFields(refTable);

      if (nameFields.length) {
        setNameFields(nameFields);
      } else if (nameField) {
        setNameFields([nameField]);
      }
    }
  };

  const syncData = async () => {
    if (!path) return;
    try {
      const data = await feathers.service(path).find({
        query: { ...(query || {}), $paginate: false },
      });
      setItems(data);
    } catch (error) {
      const data = await feathers.service(path).find({
        query: { ...(query || {}) },
      });
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems(data.data);
      }
    }
  };

  function getId(item: any) {
    return typeof item === "string" ? item : item[idProperty];
  }

  function checkId(a: any, b: any): boolean {
    return getId(a) === getId(b);
  }

  function toggle(item: any) {
    if (disabled || readOnly) return;
    if (multiple) {
      const list = Array.isArray(inputValue) ? [...inputValue] : [];
      const index = list.findIndex((it) => checkId(it, item));
      if (index !== -1) {
        if (required && list.length === 1) return;
        onChange?.(list.filter((it) => !checkId(it, item)));
      } else {
        onChange?.([...list, returnObject ? item : getId(item)]);
      }
      console.log(list, inputValue, index);
    } else {
      onChange?.(checkId(inputValue, item) ? (required ? inputValue : null) : returnObject ? item : getId(item));
    }
  }

  function isSelected(item: any): boolean {
    if (multiple) {
      return !!inputValue?.find((it: any) => checkId(it, item));
    } else {
      return checkId(inputValue, item);
    }
  }

  const clear = () => {
    onChange(multiple ? [] : null);
  };

  return (
    <div className="relative object-picker-new">
      {/* radio buttons */}
      <div className="flex flex-wrap gap-2">
        {(items || []).map((item, index) => {
          let name = typeof item === "string" ? item : nameFields.length ? item[nameFields[0].name] : item["name"];
          const isDeleted = name === undefined || name === null;
          name ??= "[DELETED]";
          const isActive = isSelected(item);
          return (
            <div
              role="button"
              key={`${index}${isActive}`}
              className={`item ${isActive ? "item-active" : ""} flex flex-row gap-x-2 items-center justify-center`}
              onClick={() => toggle(item)}
            >
              <div className={`rounded-full h-fit w-fit border-2 ${isActive ? "border-blue-500" : "border-gray-600"}`}>
                <div className={`rounded-full m-0.5 size-2 ${isActive ? "bg-blue-500" : "bg-gray-600"}`} />
              </div>
              <div className={`${isDeleted ? "text-gray-500" : ""}`}>{name}</div>
            </div>
          );
        })}
        {/* clear button */}
        {!required && (
          <div role="button" className="item" onClick={clear}>
            Clear
          </div>
        )}
      </div>
    </div>
  );
}

export default ObjectPickerNew;
