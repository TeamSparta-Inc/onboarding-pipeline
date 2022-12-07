import { LoadOrderPort } from "./LoadOrderPort";
import { SaveOrderPort } from "./SaveOrderPort";
import { UpdateOrderPort } from "./UpdateOrderPort";

export interface IPersistence extends SaveOrderPort, LoadOrderPort, UpdateOrderPort { }