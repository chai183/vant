#!/usr/bin/env swift
/**
 * macOS Vision OCR：识别图片文字并输出 JSON（含位置，便于按列还原）。
 * 用法: swift ocr-vision.swift <图片路径>
 * 或编译后: .bin/ocr-vision <图片路径>
 *
 * 输出 stdout:
 * {
 *   "width": 1000,
 *   "height": 1080,
 *   "lines": [{ "text": "...", "x": 0.1, "y": 0.2, "w": 0.3, "h": 0.02, "confidence": 0.9 }]
 * }
 * 坐标归一化到 0~1，原点在左上角。
 */

import AppKit
import Foundation
import Vision

guard CommandLine.arguments.count >= 2 else {
  fputs("用法: ocr-vision <图片路径>\n", stderr)
  exit(1)
}

let imagePath = CommandLine.arguments[1]
let imageURL = URL(fileURLWithPath: imagePath)

guard FileManager.default.fileExists(atPath: imagePath) else {
  fputs("文件不存在: \(imagePath)\n", stderr)
  exit(1)
}

guard let image = NSImage(contentsOf: imageURL) else {
  fputs("无法读取图片: \(imagePath)\n", stderr)
  exit(1)
}

var imageRect = CGRect(origin: .zero, size: image.size)
guard let cgImage = image.cgImage(forProposedRect: &imageRect, context: nil, hints: nil) else {
  fputs("无法获取 CGImage: \(imagePath)\n", stderr)
  exit(1)
}

let width = cgImage.width
let height = cgImage.height

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.usesLanguageCorrection = false
if #available(macOS 13.0, *) {
  request.automaticallyDetectsLanguage = true
}
request.recognitionLanguages = ["zh-Hans", "en-US"]

let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])

do {
  try handler.perform([request])
} catch {
  fputs("OCR 失败: \(error.localizedDescription)\n", stderr)
  exit(1)
}

struct LineOut: Encodable {
  let text: String
  let x: Double
  let y: Double
  let w: Double
  let h: Double
  let confidence: Double
}

struct ResultOut: Encodable {
  let width: Int
  let height: Int
  let lines: [LineOut]
}

let observations = request.results ?? []
var lines: [LineOut] = []

for obs in observations {
  guard let candidate = obs.topCandidates(1).first else { continue }
  let box = obs.boundingBox
  // Vision: 原点左下；转换为左上
  let x = Double(box.minX)
  let y = Double(1.0 - box.maxY)
  let w = Double(box.width)
  let h = Double(box.height)
  lines.append(
    LineOut(
      text: candidate.string,
      x: x,
      y: y,
      w: w,
      h: h,
      confidence: Double(candidate.confidence)
    )
  )
}

// 先按 y 再按 x，便于调试；Node 侧会再按列聚类
lines.sort {
  if abs($0.y - $1.y) > 0.008 { return $0.y < $1.y }
  return $0.x < $1.x
}

let encoder = JSONEncoder()
encoder.outputFormatting = [.sortedKeys]
do {
  let data = try encoder.encode(ResultOut(width: width, height: height, lines: lines))
  if let json = String(data: data, encoding: .utf8) {
    print(json)
  }
} catch {
  fputs("JSON 编码失败: \(error.localizedDescription)\n", stderr)
  exit(1)
}
