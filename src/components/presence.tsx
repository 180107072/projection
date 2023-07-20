"use client";

import {
  Children,
  FC,
  Fragment,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useRef,
} from "react";
import satori from "satori";

type ComponentKey = string | number;

function updateChildLookup(
  children: ReactElement<any>[],
  allChildren: Map<ComponentKey, ReactElement<any>>
) {
  children.forEach((child) => {
    const key = getChildKey(child);
    allChildren.set(key, child);
  });
}

function onlyElements(children: ReactNode): ReactElement<any>[] {
  const filtered: ReactElement<any>[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child)) filtered.push(child);
  });

  return filtered;
}

const getChildKey = (child: ReactElement<any>): ComponentKey => child.key || "";

export const Presence: FC<PropsWithChildren> = ({ children }) => {
  const filteredChildren = onlyElements(children);
  let childrenToRender = filteredChildren;

  const exitingChildren = useRef(
    new Map<ComponentKey, ReactElement<any> | undefined>()
  ).current;

  const presentChildren = useRef(childrenToRender);

  const allChildren = useRef(
    new Map<ComponentKey, ReactElement<any>>()
  ).current;

  const isInitialRender = useRef(true);

  useLayoutEffect(() => {
    isInitialRender.current = false;

    updateChildLookup(filteredChildren, allChildren);

    return () => {
      isInitialRender.current = true;
      allChildren.clear();
      exitingChildren.clear();
    };
  });

  childrenToRender = [...childrenToRender];

  const presentKeys = presentChildren.current.map(getChildKey);
  const targetKeys = filteredChildren.map(getChildKey);

  const numPresent = presentKeys.length;
  for (let i = 0; i < numPresent; i++) {
    const key = presentKeys[i];

    if (targetKeys.indexOf(key) === -1 && !exitingChildren.has(key)) {
      exitingChildren.set(key, undefined);
    }
  }

  exitingChildren.forEach((component, key) => {
    const child = allChildren.get(key);

    if (!child) return;

    const insertionIndex = presentKeys.indexOf(key);

    let exitingComponent = component;

    if (!exitingComponent) {
      exitingComponent = <Fragment key={getChildKey(child)}>{child}</Fragment>;
      exitingChildren.set(key, exitingComponent);
    }

    childrenToRender.splice(insertionIndex, 0, exitingComponent);
  });

  childrenToRender = childrenToRender.map((child) => {
    const key = child.key as string | number;

    return exitingChildren.has(key) ? (
      child
    ) : (
      <Fragment key={getChildKey(child)}>{child}</Fragment>
    );
  });

  return (
    <>
      {exitingChildren.size
        ? childrenToRender
        : childrenToRender.map((child) => cloneElement(child))}
    </>
  );
};
