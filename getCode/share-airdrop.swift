#!/usr/bin/env swift
import AppKit

guard CommandLine.arguments.count >= 2 else {
  fputs("用法: share-airdrop.swift <文件路径>\n", stderr)
  exit(1)
}

let url = URL(fileURLWithPath: CommandLine.arguments[1])
guard FileManager.default.fileExists(atPath: url.path) else {
  fputs("文件不存在: \(url.path)\n", stderr)
  exit(1)
}

guard let service = NSSharingService(named: .sendViaAirDrop) else {
  fputs("隔空投送不可用\n", stderr)
  exit(1)
}

if !service.canPerform(withItems: [url]) {
  fputs("当前无法通过隔空投送分享该文件\n", stderr)
  exit(1)
}

class Delegate: NSObject, NSSharingServiceDelegate {
  func sharingService(_ sharingService: NSSharingService, didShareItems items: [Any]) {
    exit(0)
  }

  func sharingService(_ sharingService: NSSharingService, didFailToShareItems items: [Any], error: Error) {
    // 用户取消也视为正常结束
    exit(0)
  }
}

let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let delegate = Delegate()
service.delegate = delegate
service.perform(withItems: [url])
app.run()
