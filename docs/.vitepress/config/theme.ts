import type { DefaultTheme } from 'vitepress';
import { nav } from './nav';

export const themeConfig: DefaultTheme.Config = {
	nav: nav, // 导航栏配置
	sidebar: [
		{
			text: 'Examples',
			items: [
				{ text: 'Markdown Examples', link: '/markdown-examples' },
				{ text: 'Runtime API Examples', link: '/api-examples' },
			],
		},
	],
	outline: {
		level: 'deep', // 右侧大纲标题层级
		label: '目录', // 右侧大纲标题文本配置
	},
	darkModeSwitchLabel: '切换日光/暗黑模式',
	sidebarMenuLabel: '文章',
	returnToTopLabel: '返回顶部',
	lastUpdated: {
		text: '最后更新', // 最后更新时间文本配置, 需先配置lastUpdated为true
		formatOptions: {
			// @ts-ignore
			dateStyle: 'medium', // full short medium
			timeStyle: 'medium', // full short medium
		},
	},
	// 文档页脚文本配置
	docFooter: {
		prev: '上一篇',
		next: '下一篇',
	},
	// 搜索配置（二选一）
	/*search: {
		provider: 'algolia',
		options: algoliaSearchOptions,
		// 本地离线搜索
		// provider: 'local',
		// options: localSearchOptions
	},*/
	// 导航栏右侧社交链接配置
	socialLinks: [
		{ icon: 'github', link: 'https://github.com/soladxy' },
		{
			icon: {
				// https://simpleicons.org/
				svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Bilibili</title><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"/></svg>',
			},
			ariaLabel: 'Bilibili',
			link: 'https://space.bilibili.com/14194765?spm_id_from=333.1007.0.0',
		},
	],
};
