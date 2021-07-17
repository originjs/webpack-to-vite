import type { ASTTransformation } from './index';
import { TransformationType } from './index';
import { FileInfo, TransformationResult } from '../astParse';
import getParser from 'jscodeshift/src/getParser';
import jscodeshift from 'jscodeshift';
import { JSCodeshift } from 'jscodeshift/src/core';

export const astTransform:ASTTransformation = async (fileInfo: FileInfo) => {
  const parser = getParser('string');
  const jscodeshiftParser : JSCodeshift = jscodeshift.withParser(parser);
  const scriptAST = jscodeshiftParser(fileInfo.source).find(jscodeshiftParser.ArrowFunctionExpression,
    {
      params: [{ type: 'Identifier' }],
      body: {
        callee: {
          name: 'require'
        },
        arguments: [
          {
            type: 'ArrayExpression',
            elements: [{ type: 'Literal' }]
          },
          {
            type: 'Identifier'
          }
        ]
      }
    }
  );
  scriptAST.find(jscodeshiftParser.Identifier).forEach(path => {
    if (path.node.name === 'require') {
      jscodeshiftParser(path).replaceWith(
        jscodeshiftParser.identifier('import')
      );
    } else {
      jscodeshiftParser(path).remove();
    }
  });
  scriptAST.find(jscodeshiftParser.ArrayExpression).forEach(path => {
    jscodeshiftParser(path).replaceWith(
      // @ts-ignore
      jscodeshiftParser.literal(path.node.elements[0].value)
    );
  });
  const transformedJs = scriptAST.toSource();

  const result: TransformationResult = {
    fileInfo: fileInfo,
    content: transformedJs,
    type: TransformationType.lazyLoadingRoutesTransformation
  }

  return result;
}

export const needReparse: boolean = false

export const needWriteToOriginFile: boolean = true

export const extensions: string[] = ['.js']

export const transformationType: TransformationType = TransformationType.lazyLoadingRoutesTransformation
