-- RenameColumn (preserves existing data, unlike drop+add)
ALTER TABLE "estados_provincias" RENAME COLUMN "latitudReferencia" TO "latitud";
ALTER TABLE "estados_provincias" RENAME COLUMN "longitudReferencia" TO "longitud";
