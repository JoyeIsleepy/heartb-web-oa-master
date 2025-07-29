"use client";
import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement>;

export default function CombineDocumentIcon(props: IconSvgProps) {
  return (
    <svg  
      viewBox="0 0 1024 1024"
      version="1.1"  
      width="21"
      height="21"
      {...props}
    >
      <path
        d="M464 48V160H326.656a16 16 0 0 0-11.328 27.328l185.344 185.344a16 16 0 0 0 22.656 0l185.344-185.344a16 16 0 0 0-11.328-27.328H560V48a48 48 0 0 0-96 0z m0 896a48 48 0 0 0 96 0V832h137.344a16 16 0 0 0 11.328-27.328L523.328 619.328a16 16 0 0 0-22.656 0l-185.344 185.344a16 16 0 0 0 11.328 27.328H464v112zM176 448a48 48 0 0 0 0 96h672a48 48 0 0 0 0-96H176z"
        fill="#24292E" 
      ></path>
    </svg>
  );
}
